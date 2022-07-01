import Debug from "../Debug";

/**
 * @static
 */
export default class ByetsUtils
{
    private constructor() {};

    static minBytesRequiredForPositive( bigint: bigint ): number
    {
        if( bigint < BigInt( 0 ) ) throw "BytesUtils.minBytesRequiredForPositive is only supposed to work for positives integers";

        const fullByteOnes = BigInt( 0b1111_1111 );

        let mask: bigint = fullByteOnes;
        let bytesRequired: number = 1;

        while( bigint !== ( bigint & mask ))
        {
            // Debug.log( ` bigint:\t\t\t${bigint.toString(2)}\n`, `bigint & mask:\t\t${(bigint & mask).toString(2)}\n`, `mask:\t\t\t${mask.toString(2)}`);

            mask = (mask << BigInt( 8 )) | fullByteOnes;
            bytesRequired++;
        }

        return bytesRequired;
    }
}