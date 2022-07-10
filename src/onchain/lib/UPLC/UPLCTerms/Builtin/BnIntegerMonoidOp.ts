import UPLCSerializable from "../../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../../types/bits/BitStream";
import JsRuntime from "../../../../../utils/JsRuntime";
import UPLCEvaluableToPrimitive from "../../UPLCPrimitive/interfaces/UPLCEvaluableToPrimitive";
import BuiltinTaggable from "./interfaces/BuiltinTaggable";
import UPLCBuiltinTag, { UPLCBuiltinTagToBitStream } from "./UPLCBuiltinTag";


export type BnIntegerMonoidOpTag 
= UPLCBuiltinTag.addInteger
| UPLCBuiltinTag.subtractInteger
| UPLCBuiltinTag.multiplyInteger
| UPLCBuiltinTag.divideInteger
| UPLCBuiltinTag.quotientInteger
| UPLCBuiltinTag.remainderInteger
| UPLCBuiltinTag.modInteger

/**
* by ```BnIntegerMonoidOp``` is meant a 
* 
* ```Bn``` -> Builtin
* 
* ```Integer```
* 
* ```Monoid``` -> binary operation operatino on asame type
* 
* ```Op``` -> operation
* 
* so we are talking of opertions of the form 
* ```ts
* function op( a: Integer, b: Integer) : Integer
* ```
* 
* includes:
* - ```addInteger```
* - ```subtractInteger```
* - ```multiplyInteger```
* - ```divideInteger```
* - ```quotientInteger```
* - ```remainderInteger```
* - ```modInteger```
* 
*/
export class BnIntegerMonoidOp<ToInteger extends UPLCEvaluableToPrimitive>
implements BuiltinTaggable, UPLCSerializable, UPLCEvaluableToPrimitive
{
    static isBnIntegerMonoidOpTag( tag: BnIntegerMonoidOpTag ): boolean
    {
        return (
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

    evaluatesToPrimitive(): "integer"
    {
        return "integer";
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
