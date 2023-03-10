import BigIntUtils from "../../../utils/BigIntUtils";
import BitUtils from "../../../utils/BitUtils";
import { BitStream } from "../BitStream";


describe("new BitStream( bigint, some_initial_n_zeroes ).toBuffer()", () => {

    it("final padding is equal to the # of missing bits to complete a byte on whole bytes initial zeroes", () => {

        let someBigInt : bigint = BigInt( 0 );
        

        for( let nInitialZeroes = 0 ; nInitialZeroes <= 8000; nInitialZeroes += 8 )
        {
            someBigInt = BigInt(
                Math.round( 
                    Math.random() * Number.MAX_SAFE_INTEGER
                )
            );

            const bitStream = new BitStream( someBigInt, nInitialZeroes );

            expect(
                bitStream.toBuffer().nZeroesAsEndPadding
            ).toEqual( 
                BitStream.getMinBytesForLength( BitUtils.getNOfUsedBits( someBigInt ) ) * 8 - BitUtils.getNOfUsedBits( someBigInt )
            );
        }
    })

    it("when some_initial_n_zeroes is not a byte the result is just shifted", () => {

        let someBigInt : bigint = BigInt( 0 );
        let someInitialOffset: number = 0;
        
        try
        {
            for( let mult8 = 0 ; mult8 < 8000; mult8 += 8 )
            {
                someBigInt = BigInt(
                    Math.round( 
                        Math.random() * Number.MAX_SAFE_INTEGER
                    )
                );
    
                someInitialOffset = Math.round( 
                    Math.random() * 100_000
                );
    
                const { buffer: bitStreamBuffer, nZeroesAsEndPadding }  = new BitStream( someBigInt, someInitialOffset ).toBuffer();
    
                expect(
                    BigIntUtils.fromBuffer(
                        bitStreamBuffer
                    )
                    // shift back to remove "useless zeroes"
                    >> BigInt( nZeroesAsEndPadding )
                ).toEqual( 
                    someBigInt
                );
            }
        }
        catch (e)
        {
            // print pseudo-random factors
            // someInitialOffset is problematic for large numbers, but under 100_000 should not cause problems
            console.error(
                `someBigInt was: ${someBigInt}`,
                `someInitialOffset was: ${someInitialOffset}`
            )
            throw e;
        }
    })

})
