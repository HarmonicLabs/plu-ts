import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborArray from "../../cbor/CborObj/CborArray";
import CborUInt from "../../cbor/CborObj/CborUInt";
import CborString from "../../cbor/CborString";
import { canBeUInteger, CanBeUInteger, forceUInteger } from "../../types/ints/Integer";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";

export default class ExecUnits
{
    readonly mem!: bigint
    readonly steps!: bigint

    constructor( mem: CanBeUInteger, steps: CanBeUInteger )
    {
        JsRuntime.assert(
            canBeUInteger( mem ) && canBeUInteger( steps ),
            "invalid arguments for 'ExecUnits'"
        );

        ObjectUtils.defineReadOnlyProperty(
            this, "mem", forceUInteger( mem )
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "steps", forceUInteger( steps )
        );
    }

    toCborObj(): CborArray
    {
        return new CborArray([
            new CborUInt( this.mem ),
            new CborUInt( this.steps )
        ]);
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
}