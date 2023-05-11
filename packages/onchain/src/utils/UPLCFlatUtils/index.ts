import { BitStream } from "@harmoniclabs/bitstream";
import BitUtils from "../BitUtils";
import { assert } from "../assert";

export type InByteOffset = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export function isInByteOffset( offset: InByteOffset ): boolean
{
    return (  
        offset === 0 ||
        offset === 1 ||
        offset === 2 ||
        offset === 3 ||
        offset === 4 ||
        offset === 5 ||
        offset === 6 ||
        offset === 7
    );
}

export interface BitStreamPadToByteOptions {
    onByteAllignedAddNewByte: boolean
    withOneAsEndPadding: boolean
}

/**
 * @static
 */
export default class UPLCFlatUtils
{
    /**
     * @deprecated this is a @static class, it is not supposed to have instances
     */
    private constructor() {};

    static zigzagBigint( bigint: bigint ): bigint
    {
        return (
            bigint >> 
                (
                    BigInt( 
                        BitUtils.getNOfUsedBits( bigint ) 
                    )
                )
        ) ^ // XOR
        ( bigint << BigInt( 1 ) );
    }

    static unzigzagBigint( bigint: bigint ): bigint
    {
        return (
            (
                (bigint >> BigInt(1))
            ) ^ // XOR
            -( bigint & BigInt(1) )
        );
    }

    /**
     * source: https://hydra.iohk.io/build/5988492/download/1/plutus-core-specification.pdf#Variable%20length%20data
     * 
     * Non-empty lists are encoded by prefixing the element stored with ‘0’ if this is the last element
     * or ‘1’ if there is more data following.
     * 
     * We encode Integers as a non-empty list of chunks, 7 bits each, with the least significant chunk
     * first and the most significant bit first in the chunk.
     */
    static encodeBigIntAsVariableLengthBitStream( integer: Readonly<bigint> ) : BitStream
    {
        assert(
            typeof integer === "bigint",
            "expected a bigint as input; got instance of type: " + typeof integer
        );

        if( integer === BigInt( 0 ) ) return BitStream.fromBinStr( "00000000" );

        assert(
            integer > BigInt( 0 ),
            "'UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream' can only encode non-negative integers; the given input was: " + integer.toString()
        )

        // store binary string for easy BitStream creation
        const chunks: string[] = [];
        let mask: bigint = BigInt( 0b0111_1111 );

        // 1. Converting to binary
        const nBits = BitUtils.getNOfUsedBits( integer );

        for( let nAddedBits = 0; nAddedBits < nBits; nAddedBits += 7 )
        {            
            // 3. Reorder chunks (least significant chunk first)
            // 
            // push at the end because the mask starts from the last signigficat chunk first
            // so chunk[1] is the second least significant and so on
            chunks.push(

                // 2. Split into 7 bit chunks
                // take 7 bits
                ( (integer & mask)
                // allign to the start 
                >> BigInt(nAddedBits) )
                // translate to biinary
                .toString( 2 )
                // make sure the bits are 7 in total
                .padStart( 7 , '0')

            );

            mask = mask << BigInt( 7 );
        }

        // 4. Add list constructor tags
        for( let i = 0; i < chunks.length; i++ )
        {
            chunks[ i ] = (i === chunks.length - 1 ? '0' : '1') + chunks[ i ];
        }

        return BitStream.fromBinStr(
            chunks.join('')
        );
    }

    static getPadBitStream( n: InByteOffset ): BitStream
    {
        assert(
            isInByteOffset( n ),
            "addPadTo only works for pads from 0 inclusive to 7 inclusive"
        );

        if( n === 0 )
        {
            return BitStream.fromBinStr(
                "1".padStart( 8 , '0' )
            )
        }

        return BitStream.fromBinStr(
            "1".padStart( n , '0' )
        );
    }

    /**
     * **_SIDE EFFECT_**: modifies the ```toPad``` ```BitStream``` passed as first argument
     * 
     * @param toPad 
     * @param n
     * @returns 
     */
    static addPadTo( toPad: BitStream, n: InByteOffset ): void
    {
        assert(
            BitStream.isStrictInstance( toPad ),
            "BitStream strict instance expected as first argument in 'UPLCFlatUtils.addPadTo'"
        );
        
        toPad.append(
            UPLCFlatUtils.getPadBitStream( n )
        );

        return;
    }

    static get padToByteDefaultOptions(): Readonly<BitStreamPadToByteOptions>
    {
        return Object.freeze({
            onByteAllignedAddNewByte: true,
            withOneAsEndPadding: true
        });
    }

    /**
     * **_SIDE EFFECT_**: modifies the ```toPad``` ```BitStream``` passed as first argument
     * 
     * @param toPad 
     * @param options 
     * @returns 
     */
     static padToByte(
        toPad: BitStream, 
        options?: Partial<BitStreamPadToByteOptions> 
    ): void
    {
        const opts = {
            ...UPLCFlatUtils.padToByteDefaultOptions,
            ...( options === undefined ? {} : options )
        };

        const nBitsMissingToByte = toPad.getNBitsMissingToByte();

        if( nBitsMissingToByte === 0 )
        {
            if( opts.onByteAllignedAddNewByte )
            {
                toPad.append(
                    BitStream.fromBinStr(
                        ( opts.withOneAsEndPadding ? "1" : "0" ).padStart( 8 , '0' )
                    )
                );
            }
            else
            {
                // do nothing, already alligned
            }

            return;
        }

        toPad.append(
            BitStream.fromBinStr(
                ( opts.withOneAsEndPadding ? "1" : "0" ).padStart( nBitsMissingToByte , '0' )
            )
        );

        return;
    }

}