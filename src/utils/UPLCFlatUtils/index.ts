import BinaryString from "../../types/bits/BinaryString";
import BitStream from "../../types/bits/BitStream";
import BitUtils from "../BitUtils";
import JsRuntime from "../JsRuntime";

/**
 * @static
 */
export default class UPLCFlatUtils
{
    /**
     * @deprecated this is a @static class, it is not supposed to have instances
     */
    private constructor() {};

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
        JsRuntime.assert(
            typeof integer === "bigint",
            "expected a bigint as input; got instance of type: " + typeof integer
        );

        JsRuntime.assert(
            integer >= BigInt( 0 ),
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
            // push at the start so that "the least significant chunk[s are] first"
            chunks.unshift(

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
            new BinaryString(
                chunks.join('')
            )
        );
    }

}