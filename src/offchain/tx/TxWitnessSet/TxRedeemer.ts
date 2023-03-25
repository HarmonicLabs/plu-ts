import JsRuntime from "../../../utils/JsRuntime"
import ObjectUtils from "../../../utils/ObjectUtils"

import { StakeCredentials, StakeValidatorHash } from "../../credentials/StakeCredentials"
import { canBeUInteger, CanBeUInteger, forceBigUInt } from "../../../types/ints/Integer"
import { dataFromCborObj } from "../../../types/Data/fromCbor"
import { dataToCborObj } from "../../../types/Data/toCbor"
import { CborString, CanBeCborString, forceCborString } from "../../../cbor/CborString"
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable"
import { Cbor } from "../../../cbor/Cbor"
import { CborObj } from "../../../cbor/CborObj"
import { CborArray } from "../../../cbor/CborObj/CborArray"
import { CborUInt } from "../../../cbor/CborObj/CborUInt"
import { BasePlutsError } from "../../../errors/BasePlutsError"
import { InvalidCborFormatError } from "../../../errors/InvalidCborFormatError"
import { ExBudget } from "../../../onchain/CEK/Machine/ExBudget"
import { Data, isData } from "../../../types/Data/Data"
import { DataB } from "../../../types/Data/DataB"
import { DataConstr } from "../../../types/Data/DataConstr"
import { Cloneable } from "../../../types/interfaces/Cloneable"
import { ToJson } from "../../../utils/ts/ToJson"
import { Hash32 } from "../../hashes/Hash32/Hash32"
import { TxBody } from "../body/TxBody"
import { Hash28 } from "../../hashes"

export const enum TxRedeemerTag {
    Spend    = 0,
    Mint     = 1,
    Cert     = 2,
    Withdraw = 3
};

export function txRdmrTagToString( tag: TxRedeemerTag ): string
{
    switch( tag )
    {
        case TxRedeemerTag.Cert: return "Cert";
        case TxRedeemerTag.Mint: return "Mint";
        case TxRedeemerTag.Spend: return "Spend";
        case TxRedeemerTag.Withdraw: return "Withdraw";
        default: return "";
    }
}

export type TxRedeemerTagStr<Tag extends TxRedeemerTag> =
    Tag extends TxRedeemerTag.Spend     ? "Spend"       :
    Tag extends TxRedeemerTag.Mint      ? "Mint"        :
    Tag extends TxRedeemerTag.Cert      ? "Cert"        :
    Tag extends TxRedeemerTag.Withdraw  ? "Withdraw"    :
    never;

export function txRedeemerTagToString<Tag extends TxRedeemerTag>( tag: Tag ): TxRedeemerTagStr<Tag>
{
    switch( tag )
    {
        case TxRedeemerTag.Spend:       return "Spend" as any;
        case TxRedeemerTag.Mint:        return "Mint" as any;
        case TxRedeemerTag.Cert:        return "Cert" as any;
        case TxRedeemerTag.Withdraw:    return "Withdraw" as any;
        default:
            throw new BasePlutsError("invalid TxRedeemerTag")
    }
}

export interface ITxRedeemer {
    tag: TxRedeemerTag
    index: CanBeUInteger
    data: Data
    execUnits: ExBudget
}

export class TxRedeemer
    implements ITxRedeemer, ToCbor, Cloneable<TxRedeemer>, ToJson
{
    
    readonly tag!: TxRedeemerTag
    /**
     * index of the input the redeemer corresponds to
    **/
    readonly index!: number
    /**
     * the actual value of the redeemer
    **/
    readonly data!: Data
    execUnits!: ExBudget

    constructor( redeemer: ITxRedeemer )
    {
        JsRuntime.assert(
            ObjectUtils.isObject( redeemer ) &&
            ObjectUtils.hasOwn( redeemer, "tag" ) &&
            ObjectUtils.hasOwn( redeemer, "index" ) &&
            ObjectUtils.hasOwn( redeemer, "data" ) &&
            ObjectUtils.hasOwn( redeemer, "execUnits" ),
            "invalid object passed to construct a 'TxRedeemer'"
        );

        const {
            tag,
            index,
            data,
            execUnits
        } = redeemer;

        JsRuntime.assert(
            tag === 0 || tag === 1 || tag === 2 || tag === 3,
            "invalid redeemer tag"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "tag",
            tag
        );

        JsRuntime.assert(
            canBeUInteger( index ),
            "invlaid redeemer index"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "index",
            Number( forceBigUInt( index ) )
        );

        JsRuntime.assert(
            isData( data ),
            "redeemer's data was not 'Data'"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "data",
            data
        );

        JsRuntime.assert(
            execUnits instanceof ExBudget,
            "invalid 'execUnits' constructing 'TxRedeemer'"
        );

        let _exUnits = execUnits.clone();

        ObjectUtils.definePropertyIfNotPresent(
            this,
            "execUnits",
            {
                get: () => _exUnits,
                set: ( newExUnits: ExBudget ) => {
                    JsRuntime.assert(
                        newExUnits instanceof ExBudget,
                        "invalid 'execUnits' constructing 'TxRedeemer'"
                    );
                    _exUnits = newExUnits.clone();
                },
                enumerable: true,
                configurable: false
            }
        );
    }

    clone(): TxRedeemer
    {
        return new TxRedeemer({
            ...this,
            data: this.data.clone(),
            execUnits: this.execUnits.clone()
        });
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.tag ),
            new CborUInt( this.index ),
            dataToCborObj( this.data ),
            this.execUnits.toCborObj()
        ])
    }

    static fromCbor( cStr: CanBeCborString ): TxRedeemer
    {
        return TxRedeemer.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): TxRedeemer
    {
        if(!(
            cObj instanceof CborArray &&
            cObj.array.length >= 4 &&
            cObj.array[0] instanceof CborUInt &&
            cObj.array[1] instanceof CborUInt
        ))
        throw new InvalidCborFormatError("TxRedeemer");

        return new TxRedeemer({
            tag: Number( cObj.array[0].num ) as any,
            index: cObj.array[1].num,
            data: dataFromCborObj( cObj.array[2] ),
            execUnits: ExBudget.fromCborObj( cObj.array[3] )
        });
    }

    toJson()
    {
        return {
            tag: txRedeemerTagToString( this.tag ),
            index: this.index,
            execUnits: this.execUnits.toJson(),
            data: this.data.toJson(),
        }
    }

    toSpendingPurposeData( tx: TxBody ): DataConstr
    {
        const tag = this.tag;

        let ctorIdx: 0 | 1 | 2 | 3;
        let purposeArgData: Data;

        if( tag === TxRedeemerTag.Mint )
        {
            ctorIdx = 0;
            const policy = tx.mint
                // "+ 1" because in `plu-ts` values we keep track of lovelaces anyway
                ?.map[ this.index + 1 ]
                .policy;
            if(!( policy instanceof Hash28 ))
            throw new BasePlutsError(
                "invalid minting policy for minting redeemer " + this.index.toString()
            );
            purposeArgData = new DataB( policy.asBytes );
        }
        else if( tag === TxRedeemerTag.Spend )
        {
            ctorIdx = 1;
            const utxoRef = tx.inputs[ this.index ].utxoRef;
            if( utxoRef === undefined )
            throw new BasePlutsError(
                "invalid utxo for spending redeemer " + this.index.toString()
            );
            purposeArgData = utxoRef.toData();
        }
        else if( tag === TxRedeemerTag.Withdraw )
        {
            ctorIdx = 2;
            const stakeAddr = tx.withdrawals?.map[ this.index ]?.rewardAccount
            if( stakeAddr === undefined )
            throw new BasePlutsError(
                "invalid stake credentials for rewarding redeemer " + this.index.toString()
            );
            purposeArgData = new StakeCredentials(
                "script",
                new StakeValidatorHash( stakeAddr.credentials )
            ).toData();
        }
        else if( tag === TxRedeemerTag.Cert )
        {
            ctorIdx = 3;
            const cert = tx.certs?.at( this.index )
            if( cert === undefined )
            throw new BasePlutsError(
                "invalid certificate for certifyng redeemer " + this.index.toString()
            );
            purposeArgData = cert.toData();
        }
        else throw new BasePlutsError(
            "invalid redeemer tag"
        );

        return new DataConstr(
            ctorIdx,
            [ purposeArgData ]
        );
    }
}