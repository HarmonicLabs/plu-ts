import Int32 from "../../types/ints/Int32";
import JsRuntime from "../JsRuntime";

/**
 * @static
 */
export default class BitUtils
{
    private constructor () {}

    /**
     * O(n)
     * where n = bytes used by @param {bigint} bits
     */
    static getFirstByte( bits: bigint ): number
    {
        return Number( `0x${bits.toString(16).slice(0,2)}` );
    }

    static andMaskOfLengthInt( n: number ): bigint
    {
        n = Math.round( Math.abs( n ) );

        // operatons used are valid on singed int32
        if( n >= 30 )
        {
            return BitUtils.andMaskOfLength( BigInt( n ) );
        }

        return BigInt( (1 << ( n - 1 ) ) - 1 );
    }

    static andMaskOfLength( n: bigint ): bigint
    {
        return BigInt( 
            (
                BigInt( 1 ) 
                << n
            ) 
            - BigInt( 1 )
        );
    }

    static getNLastBitsInt( fromNuber : Int32 , nBits: Int32 ) : Int32
    {
        JsRuntime.assert(
            fromNuber instanceof Int32 && nBits instanceof Int32,
            "can use getNLastBitsInt on Int32 instances only"
        )
        return new Int32(
            Number(
                BigInt( fromNuber.toNumber() ) 
                & 
                BitUtils.andMaskOfLength( BigInt( nBits.toNumber() ) )
            )
        );
    }

    static getNLastBits( fromNuber : bigint , nBits: bigint ) : bigint
    {
        return (fromNuber & BitUtils.andMaskOfLength( nBits ));
    }

    /**
     * number of bits from the first one on the left up untill the end
     */
    static getNOfUsedBits( bits: bigint ): number
    {
        if( bits === BigInt( 0 ) ) return 0;
        return bits.toString(2).length;
    }
}