import { BasePlutsError } from "../../errors/BasePlutsError";
import { Int32 } from "../../types/ints/Int32";
import JsRuntime from "../JsRuntime";

/**
 * @static
 */
export default class BitUtils
{
    private constructor () {}

    /**
     * @deprecated not sure it has ever made sense to have it
     * @returns a number in range ```[ 0 , 255 ]``` ( ```[ 0b0000_0000, 0b1111_1111 ]``` ) based on the first byte
     */
    static getFirstByte( bits: bigint ): number
    {
        return Number( `0x${bits.toString(16).slice(0,2)}` );
    }

    /**
     * @deprecated use ```andMaskOfLength``` instead
     */
    static andMaskOfLengthInt( n: number ): bigint
    {
        n = Math.round( Math.abs( n ) );

        // operatons used are valid on singed int32
        if( n >= 30 )
        {
            return BitUtils.andMaskOfLength( BigInt( n ) );
        }

        return BigInt( ( 1 << n ) - 1 );
    }

    /**
     * returns a ```bigint``` of that as the last ```n``` bits setted to ones;
     * 
     * example
     * ```ts
     * BitUtils.getMaskOfLength( 7 ) === Bigint( 0b0111_1111 ); // true
     * ```
     */
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

    /**
     * @deprecated use ```getNLastBits``` instead
     */
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
     * @returns the number of bits from the first setted to ```1``` on the left up until the end
     */
    static getNOfUsedBits( bits: bigint ): number
    {
        if( bits === BigInt( 0 ) ) return 0;
        return bits.toString(2).length;
    }

    static minBytesRequired( bigint: bigint ): number
    {
        if( bigint < BigInt( 0 ) ) 
            throw new BasePlutsError(
                "BitUtils.minBytesRequired works for positives integers only"
            );

        const fullByteOnes = BigInt( 0b1111_1111 );

        let mask: bigint = fullByteOnes;
        let bytesRequired: number = 1;

        while( bigint !== ( bigint & mask ))
        {
            mask = (mask << BigInt( 8 )) | fullByteOnes;
            bytesRequired++;
        }

        return bytesRequired;
    }
}