import { Buffer } from "buffer"; 
import Debug from "../Debug";
import JsRuntime from "../JsRuntime";


/**
 * @static
 */
export default class BigIntUtils
{
    private constructor () {};

    static abs( n: bigint ): bigint
    {
        return n < BigInt( 0 ) ? -n : n;
    }

    static fromBufferLE( buffer: Buffer )
    {
        return BigIntUtils.fromBuffer(
            // need to copy so that it doesn't reverses the original buffer
            Buffer.from( buffer )
            .reverse()
        );

    }

    /**
     * Big-Endian default
     */
    static fromBuffer( buffer: Buffer )
    {
        JsRuntime.assert(
            Buffer.isBuffer( buffer ),
            "expected buffer as input, while constructing a bigint instance using BigIntUtils.fromBufferBE"
        );

        const hexBuff = buffer.toString('hex');

        if ( hexBuff.length === 0 ) {
            return BigInt( 0 );
        }
        
        return BigInt( `0x${hexBuff}` );
    }

    static toBuffer( bigint: bigint, nBytes: number | undefined = undefined ): Buffer
    {
        if( bigint == BigInt( 0 ) )
        {
            if(nBytes === undefined)
            {
                return Buffer.from( [] );
            }

            return Buffer.from( "00".repeat(nBytes), "hex" )
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

        return Buffer.from( buffHexString , "hex" );
    }

}