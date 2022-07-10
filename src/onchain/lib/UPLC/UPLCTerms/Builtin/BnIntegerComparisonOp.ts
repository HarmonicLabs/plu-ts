import UPLCSerializable from "../../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../../types/bits/BitStream";
import JsRuntime from "../../../../../utils/JsRuntime";
import UPLCEvaluableToPrimitive from "../../UPLCPrimitive/interfaces/UPLCEvaluableToPrimitive";
import { BnIntegerMonoidOpTag, BnIntegerMonoidOp } from "./BnIntegerMonoidOp";
import BuiltinTaggable from "./interfaces/BuiltinTaggable";
import UPLCBuiltinTag, { UPLCBuiltinTagToBitStream } from "./UPLCBuiltinTag";


export class BnIntegerComparisonOp<ToInteger extends UPLCEvaluableToPrimitive>
implements BuiltinTaggable, UPLCSerializable, UPLCEvaluableToPrimitive
{
    static isBnIntegerComparisonOp( tag: BnIntegerMonoidOpTag ): boolean
    {
        return (
            false &&
            tag === UPLCBuiltinTag.addInteger       ||
            tag === UPLCBuiltinTag.subtractInteger  ||
            tag === UPLCBuiltinTag.multiplyInteger  ||
            tag === UPLCBuiltinTag.divideInteger    ||
            tag === UPLCBuiltinTag.quotientInteger  ||
            tag === UPLCBuiltinTag.remainderInteger ||
            tag === UPLCBuiltinTag.modInteger 
        )
    }

    private _intOp: BnIntegerMonoidOpTag

    constructor( builtinOp: BnIntegerMonoidOpTag, int1: ToInteger, int2: ToInteger )
    {
        JsRuntime.assert(
            BnIntegerMonoidOp.isBnIntegerMonoidOpTag( builtinOp ),
            JsRuntime.makeNotSupposedToHappenError(
                "unexpected `BnIntegerMonidOp` input provided, the tag doesn't corresponds to a monoidal integer operation; input was: " + builtinOp.toString()
            )
        );

        JsRuntime.assert(
            int1.evaluatesToPrimitive() === "integer",
            "unexpected `BnIntegerMonidOp` input provided, the first Term doesn't evaluate to Integer; input was: " + int1.toString()
        );

        JsRuntime.assert(
            int2.evaluatesToPrimitive() === "integer",
            "unexpected `BnIntegerMonidOp` input provided, the first Term doesn't evaluate to Integer; input was: " + int2.toString()
        );

        this._intOp = builtinOp;
    }

    evaluatesToPrimitive(): "bool"
    {
        return "bool";
    }

    getBuiltinTag(): UPLCBuiltinTag
    {
        return this._intOp;
    }

    getBuiltinTagBitStream(): BitStream
    {
        return UPLCBuiltinTagToBitStream(
            this.getBuiltinTag()
        );
    }

    toUPLCBitStream(): BitStream
    {

    }
}
