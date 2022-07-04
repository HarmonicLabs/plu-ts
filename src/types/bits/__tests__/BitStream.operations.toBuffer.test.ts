import BigIntUtils from "../../../utils/BigIntUtils";
import BitStream from "../BitStream";


describe("BitStream.toBuffer()", () => {



})

describe("BitStream.toBuffer().nZeroesAsPadding", () => {

    it("is always 0 when initial zeroes are multiple of 8", () => {

        for( let mult8 = 0; mult8 <= 8 * 20; mult8 += 8 )
        {
            expect(
                new BitStream( BigInt( 100 ), mult8 ).toBuffer().nZeroesAsEndPadding
            ).toBe( 0 );
        }

    });

    it("is (8 - (nInitialZeroes % 8)) when initial zeroes are not multiple of 8", () => {
        
        for( let i = 0; i <= 100; i++ )
        {
            if( i % 8 === 0 ) continue;
            expect(
                new BitStream( BigInt( 100 ), i ).toBuffer().nZeroesAsEndPadding
            ).toBe( 8 - (i % 8) );
        }

        let rand: number = 0;
        try
        {
            for( let i = 0; i <= 100; i++ )
            {
                rand = Math.round(Math.random() * 950_000) + 100;

                if( rand % 8 === 0 ) continue;

                expect(
                    new BitStream( BigInt( 100 ), rand ).toBuffer().nZeroesAsEndPadding
                ).toBe( 8 - (rand % 8) );
            }
        }
        catch (e)
        {
            console.error( "rand was: ", rand )
            throw e;
        }

    });

})

describe("new BitStream( bigint, some_initial_n_zeroes ).toBuffer()", () => {

    it("some_initial_n_zeroes is multiple of 8 => bitStream.toBuffer().buffer == BigIntUtils.toBuffer( bigint , bitStream.lengthInBytes )", () => {

        let someBigInt : bigint = BigInt( 0 );
        
        for( let mult8 = 0 ; mult8 < 8_000; mult8 += 8 )
        {
            someBigInt = BigInt(
                Math.round( 
                    Math.random() * Number.MAX_SAFE_INTEGER
                )
            );

            const bitStream = new BitStream( someBigInt, mult8 );

            expect(
                bitStream.toBuffer().buffer
            ).toEqual( 
                BigIntUtils.toBuffer( 
                    someBigInt,
                    bitStream.lengthInBytes
                )
            );
        }
    })

    it("some_initial_n_zeroes is multiple of 8 => there is no final padding", () => {

        let someBigInt : bigint = BigInt( 0 );
        
        for( let mult8 = 0 ; mult8 < 8_000; mult8 += 8 )
        {
            someBigInt = BigInt(
                Math.round( 
                    Math.random() * Number.MAX_SAFE_INTEGER
                )
            );

            const bitStream = new BitStream( someBigInt, mult8 );

            expect(
                bitStream.toBuffer().nZeroesAsEndPadding
            ).toEqual( 
                0
            );
        }
    })

    it("when some_initial_n_zeroes is not a byte the result is just shifted", () => {

        let someBigInt : bigint = BigInt( 0 );
        let someInitialOffset: number = 0;
        
        try
        {
            for( let mult8 = 0 ; mult8 < 8_000; mult8 += 8 )
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
            console.error(
                `someBigInt was: ${someBigInt}`,
                `someInitialOffset was: ${someInitialOffset}`
            )
            throw e;
        }
    })

})
