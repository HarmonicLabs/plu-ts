import { Buffer } from "buffer";
import HexString from "../../types/HexString";
import JsRuntime from "../JsRuntime";

export default
class BufferUtils
{
    private constructor() {};

    static copy( buffer: Buffer ): Buffer
    {
        return Buffer.from( buffer )
    }

    static fromHex( hex:  string | HexString )
    {
        if( typeof hex === "string" )
        {
            JsRuntime.assert(
                HexString.isHex( hex ),
                "constructing a Buffer using BufferUtils.fromHex with " + hex + " as input"
            );

            return Buffer.from( hex, "hex" );
        }

        return hex.asBytes;
    }

    static randomBufferOfLength( length: number, mustStartWith: number[] = [] ): Buffer
    {
        length = Math.round( Math.abs( length ) );

        let byteNums: number[] = mustStartWith.map( n => Math.round( Math.abs(n) ) % 256 );

        for( let i = 0; i < length * 2; i++ )
        {
            byteNums.push( Math.round(Math.random() * 255 ) );
        }

        return Buffer.from( byteNums );
    }
}