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

    static randomBufferOfLength( length: number ): Buffer
    {
        length = Math.round( Math.abs( length ) );

        const hexDigits = "0123456789abcef";
        let hexBuffer = "";

        for( let i = 0; i < length * 2; i++ )
        {
            hexBuffer += hexDigits[ Math.round(Math.random() * hexDigits.length ) ];
        }

        return Buffer.from( hexBuffer, "hex" );
    }
}