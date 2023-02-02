import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborArray from "../../cbor/CborObj/CborArray";
import CborSimple from "../../cbor/CborObj/CborSimple";
import CborString, { CanBeCborString, forceCborString } from "../../cbor/CborString";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import AuxiliaryData from "./AuxiliaryData/AuxiliaryData";
import VKey from "./TxWitnessSet/VKeyWitness/VKey";
import TxBody, { ITxBody, isITxBody } from "./body/TxBody";
import TxWitnessSet, { ITxWitnessSet, isITxWitnessSet } from "./TxWitnessSet/TxWitnessSet";
import Hash32 from "../hashes/Hash32/Hash32";
import { signEd25519 } from "../../crypto";
import Hash28 from "../hashes/Hash28/Hash28";
import PubKeyHash from "../credentials/PubKeyHash";
import PrivateKey from "../credentials/PrivateKey";
import VKeyWitness from "./TxWitnessSet/VKeyWitness/VKeyWitness";
import ToJson from "../../utils/ts/ToJson";
import Signature from "../hashes/Signature";
import BasePlutsError from "../../errors/BasePlutsError";
import InvalidCborFormatError from "../../errors/InvalidCborFormatError";

export interface ITx {
    body: ITxBody
    witnesses: ITxWitnessSet
    isScriptValid?: boolean
    auxiliaryData?: AuxiliaryData | null
}

export default class Tx
    implements ITx, ToCbor, ToJson
{
    readonly body!: TxBody
    readonly witnesses!: TxWitnessSet
    readonly isScriptValid!: boolean
    readonly auxiliaryData?: AuxiliaryData | null

    /**
     * checks that the signer is needed
     * if true adds the witness
     * otherwise nothing happens (the signature is not added)
     * 
     * one might prefer to use this method instead of `signWith`
     * when signature is provided by a third party (example CIP30 wallet)
    **/
    // readonly addVKeyWitnessIfNeeded!: ( vkeyWit: VKeyWitness ) => void
    /**
     * checks that the signer is needed
     * if true signs the transaction with the specified key
     * otherwise nothing happens (the signature is not added)
    **/
    // readonly signWith!: ( signer: PrivateKey ) => void
    /**
     * @returns {boolean}
     *  `true` if all the signers needed
     *  have signed the transaction; `false` otherwise
     * 
     * signers needed are:
     *  - required to spend an utxo
     *  - required by certificate
     *  - required by withdrawals
     *  - additional spefified in the `requiredSigners` field
     */
    // readonly isComplete!: () => boolean
    /**
     * getter
     */
    readonly hash!: Hash32;

    constructor(tx: ITx)
    {
        const {
            body,
            witnesses,
            isScriptValid,
            auxiliaryData
        } = tx;

        JsRuntime.assert(
            body instanceof TxBody || isITxBody( body ),
            "invalid transaction body; must be instance of 'TxBody'"
        );
        JsRuntime.assert(
            isITxWitnessSet( witnesses ),
            "invalid wintesses; must be instance of 'TxWitnessSet'"
        );
        JsRuntime.assert(
            isScriptValid === undefined || typeof isScriptValid === "boolean",
            "'isScriptValid' ('Tx' third paramter) must be a boolean"
        );
        JsRuntime.assert(
            auxiliaryData === undefined ||
            auxiliaryData === null ||
            auxiliaryData instanceof AuxiliaryData,
            "invalid transaction auxiliray data; must be instance of 'AuxiliaryData'"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "body",
            new TxBody( body )
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "witnesses",
            new TxWitnessSet( witnesses, getAllRequiredSigners( this.body ) )
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "isScriptValid",
            isScriptValid === undefined ? true : isScriptValid
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "auxiliaryData",
            auxiliaryData
        );

        ObjectUtils.definePropertyIfNotPresent(
            this, "hash",
            {
                // needs to be a getter because `this.body.hash` is a getter
                get: (): Hash32 => this.body.hash,
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        /*
        ObjectUtils.defineReadOnlyProperty(
            this, "addVKeyWitnessIfNeeded",
            this.witnesses.addVKeyWitnessIfNeeded
        );

        ObjectUtils.defineReadOnlyProperty(
            this, "signWith",
            ( signer: PrivateKey ): void => {
                const [ derivedPubKey, signature ] = signEd25519( this.body.hash.asBytes, signer.asBytes );

                this.addVKeyWitnessIfNeeded(
                    new VKeyWitness(
                        new VKey( Buffer.from( derivedPubKey ) ),
                        new Signature( Buffer.from( signature ) )
                    )
                );
            }
        )

        ObjectUtils.defineReadOnlyProperty(
            this, "isComplete",
            this.witnesses.isComplete
        );
        //*/
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborArray([
            this.body.toCborObj(),
            this.witnesses.toCborObj(),
            new CborSimple( this.isScriptValid ),
            this.auxiliaryData === undefined || this.auxiliaryData === null ?
                new CborSimple( null ) :
                this.auxiliaryData.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): Tx
    {
        return Tx.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): Tx
    {
        if( !(cObj instanceof CborArray) )
        throw new InvalidCborFormatError("Tx");
        
        const [ _body, _wits, _isValid, _aux ] = cObj.array;

        if(!(
            _isValid instanceof CborSimple &&
            typeof (_isValid.simple) === "boolean"
        ))
        throw new InvalidCborFormatError("Tx","isScriptValid is not a boolean")

        return new Tx({
            body: TxBody.fromCborObj( _body ),
            witnesses: TxWitnessSet.fromCborObj( _wits ),
            isScriptValid: _isValid.simple,
            auxiliaryData: AuxiliaryData.fromCborObj( _aux )
        })
    }

    toJson()
    {
        return {
            body: this.body.toJson(),
            witnesses: this.witnesses.toJson(),
            isScriptValid: this.isScriptValid,
            auxiliaryData: this.auxiliaryData?.toJson()
        }
    }

}

/**
 * signers needed are:
 *  - required to spend an utxo
 *  - required by certificate
 *  - required by withdrawals
 *  - additional specified in the `requiredSigners` field
 */
export function getAllRequiredSigners( body: Readonly<TxBody> ): Hash28[]
{
    return (
        body.inputs
        .reduce(
            ( acc, _in ) => {

                const { type, hash } =  _in.resolved.address.paymentCreds;

                if( type === "pubKey" ) acc.push( new PubKeyHash( hash ) );

                return acc;
            },
            [] as Hash28[]
        ).concat(
            ...body.requiredSigners
            ?.map( sig => sig.clone() ) ?? []
        )
    // remove duplicates
    ).filter( ( elem, i, thisArr ) => thisArr.indexOf( elem ) === i );
}

export function getNSignersNeeded( body: Readonly<TxBody> ): number
{
    const n = getAllRequiredSigners( body ).length
    return n === 0 ? 1 : n;
}