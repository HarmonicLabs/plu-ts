import { isUint8Array } from "../../uint8Array/isUint8Array";
import JsRuntime from "../../utils/JsRuntime";
import { ToRawObj } from "./interfaces/ToRawObj";

export type RawCborBytes = {
    bytes: Uint8Array
}

export function isRawCborBytes( b: RawCborBytes ): boolean
{
    if( typeof b !== "object" ) return false;
    
    const keys = Object.keys( b );

    return (
        keys.length === 1 &&
        keys[0] === "bytes"  &&
        isUint8Array( b.bytes )
    );
}

export class CborBytes
    implements ToRawObj
{
    private _buff : Uint8Array;
    get buffer(): Uint8Array { return this._buff.slice() }
    
    constructor( bytes: Uint8Array )
    {
        JsRuntime.assert(
            isUint8Array(bytes),
            "invalid buffer in CborBytes"
        );

        this._buff = bytes;
    }

    toRawObj(): RawCborBytes
    {
        return {
            bytes: this.buffer
        };
    }
}
