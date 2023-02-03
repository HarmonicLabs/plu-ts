import BufferUtils from "../../utils/BufferUtils";
import JsRuntime from "../../utils/JsRuntime";
import { ToRawObj } from "./interfaces/ToRawObj";

export type RawCborBytes = {
    bytes: Buffer
}

export function isRawCborBytes( b: RawCborBytes ): boolean
{
    if( typeof b !== "object" ) return false;
    
    const keys = Object.keys( b );

    return (
        keys.length === 1 &&
        keys[0] === "bytes"  &&
        Buffer.isBuffer( b.bytes )
    );
}

export class CborBytes
    implements ToRawObj
{
    private _buff : Buffer;
    get buffer(): Buffer { return BufferUtils.copy( this._buff ) }
    
    constructor( bytes: Buffer )
    {
        JsRuntime.assert(
            Buffer.isBuffer(bytes),
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
