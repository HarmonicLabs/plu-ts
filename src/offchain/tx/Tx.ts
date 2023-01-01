import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborArray from "../../cbor/CborObj/CborArray";
import CborSimple from "../../cbor/CborObj/CborSimple";
import CborString from "../../cbor/CborString";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import AuxiliaryData from "./AuxiliaryData/AuxiliaryData";
import VKey from "./TxWitnessSet/VKeyWitness/VKey";
import TxBody, { ITxBody, isITxBody } from "./body/TxBody";
import TxWitnessSet, { ITxWitnessSet, isITxWitnessSet } from "./TxWitnessSet/TxWitnessSet";
import Hash32 from "../hashes/Hash32/Hash32";
import { blake2b_256 } from "../../crypto";

export interface ITx {
    body: ITxBody
    witnesses: ITxWitnessSet
    isScriptValid?: boolean
    auxiliaryData?: AuxiliaryData | null
}

export default class Tx
    implements ITx, ToCbor
{
    readonly body!: TxBody
    readonly witnesses!: TxWitnessSet
    readonly isScriptValid!: boolean
    readonly auxiliaryData?: AuxiliaryData | null

    /**
     * checks that the signer is needed
     * if true signs the transaction with the public key
     * otherwise nothing happens (the signature is not added)
    **/
    readonly sign: ( signer: VKey ) => void
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
    readonly isComplete: () => boolean

    /**
     * getter
     */
    readonly hash: Hash32;

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
            witnesses instanceof TxWitnessSet ? witnesses : new TxWitnessSet( witnesses )
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
                get: (): Hash32 => this.body.hash,
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        missing sign and isComplete implementation
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

}