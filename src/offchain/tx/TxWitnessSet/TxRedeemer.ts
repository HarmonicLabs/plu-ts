import Cbor from "../../../cbor/Cbor"
import CborObj from "../../../cbor/CborObj"
import CborArray from "../../../cbor/CborObj/CborArray"
import CborUInt from "../../../cbor/CborObj/CborUInt"
import CborString from "../../../cbor/CborString"
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable"
import ExBudget from "../../../onchain/CEK/Machine/ExBudget"
import Data, { isData } from "../../../types/Data"
import { dataToCborObj } from "../../../types/Data/toCbor"
import { canBeUInteger, CanBeUInteger, forceUInteger } from "../../../types/ints/Integer"
import JsRuntime from "../../../utils/JsRuntime"
import ObjectUtils from "../../../utils/ObjectUtils"

export const enum TxRedeemerTag {
    Spend    = 0,
    Mint     = 1,
    Cert     = 2,
    Withdraw = 3
};

export interface ITxRedeemer {
    tag: TxRedeemerTag
    index: CanBeUInteger
    data: Data
    execUnits: ExBudget
}

export default class TxRedeemer
    implements ITxRedeemer, ToCbor
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
            Number( forceUInteger( index ).asBigInt )
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
}