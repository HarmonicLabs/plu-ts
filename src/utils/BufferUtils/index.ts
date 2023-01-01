import { Buffer } from "buffer";
import HexString from "../../types/HexString";
import JsRuntime from "../JsRuntime";

export const enum Ord {
    LT = -1,
    EQ = 0,
    GT = 1
}

export default class BufferUtils
{
    private constructor() {};

    static copy( buffer: Buffer ): Buffer
    {
        return Buffer.from( Array.from( buffer ) )
    }

    static eq( a: Readonly<Buffer>, b: Readonly<Buffer> ): boolean
    {
        return (
            a.length === b.length &&
            a.every( (byte, i) => byte === b.at( i ) )
        ); 
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

        for( let i = byteNums.length; i < length; i++ )
        {
            byteNums.push( Math.round( Math.random() * 255 ) );
        }

        return Buffer.from( byteNums );
    }

    static lexCompare( a: Buffer, b: Buffer ): Ord
    {
        const len = Object.freeze({
            isEq: a.length === b.length,
            isLess: a.length < b.length
        });

        const minLen = len.isLess ? a.length : b.length;

        for( let i = 0; i < minLen; i++ )
        {
            const _a = a.at(i);
            const _b = b.at(i);
            if( _a === undefined ) return Ord.LT;
            if( _b === undefined ) return Ord.GT;

            if( _a < _b ) return Ord.LT;
            if( _a > _b) return Ord.GT;
            // if( _a === _b ) continue;
        }

        return Ord.EQ;
    }
}