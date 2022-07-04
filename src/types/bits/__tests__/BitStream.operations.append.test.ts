import BigIntUtils from "../../../utils/BigIntUtils";
import BufferUtils from "../../../utils/BufferUtils";
import BitStream from "../BitStream";


describe("BitStream.append both inputs generated from buffer", () => {

    it.only("appends form entire buffers are just fine",() => {

        let someBuffer1 : Buffer;
        let someBuffer2 : Buffer;

        let someBits1 : BitStream;
        let someBits2 : BitStream;

        const fstInitialZeroes = new Array(8).fill(0);
        const sndInitialZeroes = new Array(8).fill(0);
        const pairs: [number, number][] = []

        for(let i = 0; i < 1000; i++ )
        {
            someBuffer1 =  
                BufferUtils.randomBufferOfLength(
                    Math.round( Math.random() * 100 )
                );
            someBits1 = new BitStream( someBuffer1 );

            someBuffer2 = 
                BufferUtils.randomBufferOfLength(
                    Math.round( Math.random() * 100 )
                );
            someBits2 = new BitStream( someBuffer2 );

            
            
            // special case
            if( someBuffer1.length === 0 && someBuffer2.length === 0 ) continue;
            
            // special case
            if( !(someBits1.nInitialZeroes === 7) ) continue;
            if( (someBits2.nInitialZeroes === 7) ) continue;

            fstInitialZeroes[ someBits1.nInitialZeroes ]++;
            sndInitialZeroes[ someBits2.nInitialZeroes ]++;
            pairs.push([someBits1.nInitialZeroes,someBits2.nInitialZeroes])
            
            console.log([someBits1.nInitialZeroes,someBits2.nInitialZeroes]);

            // console.log( 
            //     `someBuffer1: ${someBuffer1.toString("hex")}`,
            //     `someBuffer2: ${someBuffer2.toString("hex")}`
            // )

            someBits1.append( someBits2 );

            // the first buffer can have initial zeroes (not counted in bigint representation)
            // causing a shift in the final buffer
            const { buffer: concatenatedBuffer, nZeroesAsEndPadding } = someBits1.toBuffer()
            const effectiveBits = new BitStream(
                BigIntUtils.fromBuffer( concatenatedBuffer ) >> BigInt( nZeroesAsEndPadding )
            );

            expect( 
                effectiveBits.toBuffer().buffer.toString( "hex" )
            ).toEqual(

                
                Buffer.from(
                    Array.from<number>(
                        someBuffer1
                    ).concat(
                        Array.from<number>(
                            someBuffer2
                        ) 
                    )
                ).toString( "hex" )

            )

            
        }

        console.log( fstInitialZeroes, sndInitialZeroes );
        console.log( pairs );
    });

    it("specific case: first buffer has one starting zero", () => {

        const buff1 = Buffer.from( "789788a4e347", "hex" );
        const buff2 = Buffer.from( "98f7235b25f4b1fec898cf566c416935748c46536768", "hex" );

        const bits1 = new BitStream( buff1 );
        const bits2 = new BitStream( buff2 );

        bits1.append( bits2 );

        const { buffer: concatenatedBuffer, nZeroesAsEndPadding } = bits1.toBuffer()
        const effectiveBits = new BitStream(
            BigIntUtils.fromBuffer( concatenatedBuffer ) >> BigInt( nZeroesAsEndPadding )
        );

        expect( 
            effectiveBits.toBuffer().buffer.toString( "hex" )
        ).toEqual(

            Buffer.from(
                Array.from<number>(
                    buff1
                ).concat(
                    Array.from<number>(
                        buff2
                    ) 
                )
            ).toString( "hex" )

        );

    })

    it("specific case: first buffer is null and second has 4 starting zeroes", () => {

        const buff1 = Buffer.from( [] );
        const buff2 = Buffer.from( "0abc7b8236744a92c6cc15f454f709086074b785b64b3f26e3f7393b16ea45712632e31eff1a5542f48b890c", "hex" );

        const bits1 = new BitStream( buff1 );
        const bits2 = new BitStream( buff2 );

        bits1.append( bits2 );

        const { buffer: concatenatedBuffer, nZeroesAsEndPadding } = bits1.toBuffer()
        const effectiveBits = new BitStream(
            BigIntUtils.fromBuffer( concatenatedBuffer ) >> BigInt( nZeroesAsEndPadding )
        );

        expect( 
            effectiveBits.toBuffer().buffer.toString( "hex" )
        ).toEqual(

            Buffer.from(
                Array.from<number>(
                    buff1
                ).concat(
                    Array.from<number>(
                        buff2
                    ) 
                )
            ).toString( "hex" )

        );

    })

    it("specific case", () => {

        const buff1 = Buffer.from( "445acf72", "hex" );
        const buff2 = Buffer.from( "9535f8a234", "hex" );

        const bits1 = new BitStream( buff1 );
        const bits2 = new BitStream( buff2 );

        bits1.append( bits2 );

        const { buffer: concatenatedBuffer, nZeroesAsEndPadding } = bits1.toBuffer()
        const effectiveBits = new BitStream(
            BigIntUtils.fromBuffer( concatenatedBuffer ) >> BigInt( nZeroesAsEndPadding )
        );

        expect( 
            effectiveBits.toBuffer().buffer.toString( "hex" )
        ).toEqual(

            Buffer.from(
                Array.from<number>(
                    buff1
                ).concat(
                    Array.from<number>(
                        buff2
                    ) 
                )
            ).toString( "hex" )

        );

    })

    /**
     * the test is wrong
     * 
     * since we have 7 bits as starting zeroes in the
    */
    it.skip("specific case: first buffer has 2 initial zeroes and second has 7", () => {

        const buff1 = Buffer.from( "37a84418988ee6062a7ca2906a2387c629bbac108ef233afe8abeb6561a474e2", "hex"  );
        const buff2 = Buffer.from( "00a38f548cc22a35a0382e851479674af9eb", "hex" );

        const bits1 = new BitStream( buff1 );
        const bits2 = new BitStream( buff2 );

        bits1.append( bits2 );

        const { buffer: concatenatedBuffer, nZeroesAsEndPadding } = bits1.toBuffer()
        const effectiveBits = new BitStream(
            BigIntUtils.fromBuffer( concatenatedBuffer ) >> BigInt( nZeroesAsEndPadding )
        );

        expect( 
            effectiveBits.toBuffer().buffer.toString( "hex" )
        ).toEqual(

            Buffer.from(
                Array.from<number>(
                    buff1
                ).concat(
                    Array.from<number>(
                        buff2
                    ) 
                )
            ).toString( "hex" )

        );

    })

})