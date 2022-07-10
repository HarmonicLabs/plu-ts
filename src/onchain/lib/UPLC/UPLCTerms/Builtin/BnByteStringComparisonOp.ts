import UPLCSerializable from "../../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../../types/bits/BitStream";
import JsRuntime from "../../../../../utils/JsRuntime";
import { TypeOfUPLCPrimitive } from "../../UPLCPrimitive";
import UPLCEvaluableToPrimitive from "../../UPLCPrimitive/interfaces/UPLCEvaluableToPrimitive";
import BuiltinTaggable from "./interfaces/BuiltinTaggable";
import UPLCBuiltinTag from "./UPLCBuiltinTag";

export type BnByteStringComparisonOpTag
    = UPLCBuiltinTag.equalsByteString
    | UPLCBuiltinTag.lessThanByteString
    | UPLCBuiltinTag.lessThanByteString;

export default class BnByteStringComparisonOp<ToByteString extends UPLCEvaluableToPrimitive>
    implements BuiltinTaggable, UPLCSerializable, UPLCEvaluableToPrimitive
{
    private _op: BnByteStringComparisonOpTag;

    constructor( op: BnByteStringComparisonOpTag, bs1: ToByteString, bs2: ToByteString )
    {
        JsRuntime.throw("asserts not implemented");
        this._op = op;
    }

    getBuiltinTag(): BnByteStringComparisonOpTag
    {
        return this._op;
    }

    getBuiltinTagBitStream(): BitStream
    {

    }

    evaluatesToPrimitive(): "bool"
    {
        return "bool";
    }

    toUPLCBitStream(): BitStream
    {

    }

}