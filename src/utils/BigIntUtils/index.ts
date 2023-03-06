import { fromHex, isUint8Array, toHex } from "../../uint8Array";
import JsRuntime from "../JsRuntime";

/**
 * @static
 */
export default class BigIntUtils
{
    private constructor () {};

    /**
     * same as ```Math.abs``` but for bigints
     */
    static abs( n: bigint ): bigint
    {
        return n < BigInt( 0 ) ? -n : n;
    }

    /**
     * @returns {bigint} a ```bigint``` between ```0``` and ```Number.MAX_SAFE_INTEGER``` so that is safe to convert to Number for whatever reason 
     */
     static random(): bigint
     {
         return BigInt(
             Math.round(
                 Math.random() * Number.MAX_SAFE_INTEGER
             )
         );
     }

    static max( ...nums: bigint[] ): bigint
    {
        return nums.reduce( (a,b) => a > b ? a : b );
    }

    static min( ...nums: bigint[] ): bigint
    {
        return nums.reduce( (a,b) => a < b ? a : b );
    }

    static log2( num: bigint ): bigint
    {
        if( num === BigInt(0) ) return BigInt(0);
        if( num < BigInt(0) ) return -BigIntUtils.log2( BigIntUtils.abs( num ) );
        
        let n = BigInt( num );
        let result = BigInt( 0 );
        while( n >>= BigInt( 1 ) ) result++;
        return result;
    }

    /**
     * uses the bytes of the buffer to construct a BigInteger
     * > **IMPORTANT** the bytes are considered in Little Endian order; use ```BigIntUtils.fromBuffer``` for Big Endian
     */
    static fromBufferLE( buffer: Uint8Array ): bigint
    {
        return BigIntUtils.fromBuffer(
            // need to copy so that it doesn't reverses the original buffer
            Uint8Array.from( buffer )
            .reverse()
        );

    }

    /**
     * converts a Uint8Array to a ```bigint```
     * Big-Endian default
     */
    static fromBuffer( buffer: Uint8Array ): bigint
    {
        JsRuntime.assert(
            isUint8Array( buffer ),
            "expected buffer as input, while constructing a bigint instance using BigIntUtils.fromBufferBE"
        );

        const hexBuff = toHex( buffer );

        if ( hexBuff.length === 0 ) {
            return BigInt( 0 );
        }
        
        return BigInt( `0x${hexBuff}` );
    }

    /**
     * converts a ```bigint``` to a ```Uint8Array``` of length ```nBytes``` given as second argument
     * 
     * if ```nBytes``` is not specified the Uint8Array takes only the bytes needed
     * @param bigint 
     * @param nBytes 
     * @returns 
     */
    static toBuffer( bigint: bigint, nBytes: number | undefined = undefined ): Uint8Array
    {
        JsRuntime.assert(
            bigint >= BigInt( 0 ),
            "cannot convert negative bigint to buffer"
        );

        if( bigint == BigInt( 0 ) )
        {
            if(nBytes === undefined)
            {
                return Uint8Array.from( [] );
            }

            return new Uint8Array( nBytes )
        }
        
        let buffHexString = bigint.toString(16);
        buffHexString = buffHexString.length % 2 === 0 ? buffHexString : '0' + buffHexString;


        if( nBytes !== undefined )
        {
            JsRuntime.assert(
                Math.round( Math.abs( nBytes ) ) === nBytes,
                "cannot construct a buffer of length " + nBytes + ", while using BigIntUtils.toBufferOfNBytesBE"
            );

            // pads with zeroes so that the final length is of nBytes*2 (2 hex digits per byte)
            // String.prototype.padStart docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
            buffHexString = buffHexString.padStart( nBytes * 2, "00" );  
            
            if( buffHexString.length > nBytes * 2 )
            {
                console.warn(
                    "required buffer size is smaller than the one used effectively by the given bigint, truncating the initial bytes as overflow"
                );

                buffHexString = buffHexString.slice( buffHexString.length - (nBytes * 2) );
            }
        }

        return fromHex( buffHexString );
    }

}