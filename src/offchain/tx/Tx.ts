import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborArray from "../../cbor/CborObj/CborArray";
import CborSimple from "../../cbor/CborObj/CborSimple";
import CborString from "../../cbor/CborString";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import AuxiliaryData from "./AuxiliaryData/AuxiliaryData";
import TxBody from "./body/TxBody";
import TxWitnessSet from "./TxWitnessSet/TxWitnessSet";

export interface ITx {
    body: TxBody
    witnesses: TxWitnessSet
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

    constructor(tx: ITx)
    {
        const {
            body,
            witnesses,
            isScriptValid,
            auxiliaryData
        } = tx;

        JsRuntime.assert(
            body instanceof TxBody,
            "invalid transaction body; must be instance of 'TxBody'"
        );
        JsRuntime.assert(
            witnesses instanceof TxWitnessSet,
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
            body
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "witnesses",
            witnesses
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