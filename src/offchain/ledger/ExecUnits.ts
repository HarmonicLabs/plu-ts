import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborArray from "../../cbor/CborObj/CborArray";
import CborUInt from "../../cbor/CborObj/CborUInt";
import CborString from "../../cbor/CborString";
import { CanBeUInteger, forceUInteger } from "../../types/ints/Integer";

export default class ExecUnits
{
    readonly mem: number
    readonly steps: number

    constructor( mem: CanBeUInteger, steps: CanBeUInteger )
    {

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