import BigIntUtils from "../../../utils/BigIntUtils";
import BitUtils from "../../../utils/BitUtils";
import BufferUtils from "../../../utils/BufferUtils";
import Debug from "../../../utils/Debug";
import BitStream from "../BitStream";


function makeSpecificBufferCase( hexBuff1: string | number[] , hexBuff2: string | number[] )
{
    const buff1 = typeof hexBuff1 === "string" ? Buffer.from( hexBuff1, "hex" ) : Buffer.from( hexBuff1 );
    const buff2 = typeof hexBuff2 === "string" ? Buffer.from( hexBuff2, "hex" ) : Buffer.from( hexBuff2 );

    const bits1 = Debug.ignore.Proxies.withNoisySet(
        new BitStream( buff1 )
    );
    const bits2 = Debug.ignore.Proxies.withNoisySet(
        new BitStream( buff2 )
    );

    bits1.append( bits2 );

    const { buffer: concatenatedBuffer, nZeroesAsEndPadding } = bits1.toBuffer()
    const effectiveBits = new BitStream(
        BigIntUtils.fromBuffer( concatenatedBuffer ) >> BigInt( nZeroesAsEndPadding ),
        bits1.nInitialZeroes
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
}

describe("BitStream.append both inputs generated from buffer", () => {

    it.concurrent("appends form entire buffers are just fine",() => {

        let someBuffer1 : Buffer;
        let someBuffer2 : Buffer;

        let someBits1 : BitStream;
        let someBits2 : BitStream;

        const fstInitialZeroes = new Array(24).fill(0);
        const sndInitialZeroes = new Array(24).fill(0);

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

            // some stats
            fstInitialZeroes[ someBits1.nInitialZeroes ]++;
            sndInitialZeroes[ someBits2.nInitialZeroes ]++;
            
            Debug.ignore.log( 
                `someBuffer1: ${someBuffer1.toString("hex")}`,
                `someBuffer2: ${someBuffer2.toString("hex")}`
            )

            someBits1.append( someBits2 );

            // the first buffer can have initial zeroes (not counted in bigint representation)
            // causing a shift in the final buffer
            const { buffer: concatenatedBuffer, nZeroesAsEndPadding } = someBits1.toBuffer()
            const effectiveBits = new BitStream(
                BigIntUtils.fromBuffer( concatenatedBuffer ) >> BigInt( nZeroesAsEndPadding ),
                someBits1.nInitialZeroes
            );

            // 69fc058cc9de32ce8e0537d37f83a8df0365e9342ed1480d4cacdb32a75d2302c1974aceae7e2f69466ddaf5b815058432f5dfed5f4d66919f51461ee831cd0aa765b42da28a22157e93eb9f36584d250a362d6da032bf880700

            if(
                effectiveBits.toBuffer().buffer.toString( "hex" ) !==
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
            {
                throw [
                    "concatenation failed on inputs:",
                    someBuffer1.toString("hex"),
                    someBuffer2.toString("hex")
                ];
            }
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

        Debug.log( fstInitialZeroes, sndInitialZeroes );
    });

    it("specific case: both buffers empty", () => {

        makeSpecificBufferCase(
            [],
            []
        );

    })

    it("specific case: first buffer is null and second has 4 starting zeroes", () => {

        makeSpecificBufferCase(
            [],
            "0abc7b8236744a92c6cc15f454f709086074b785b64b3f26e3f7393b16ea45712632e31eff1a5542f48b890c"
        );

    })

    it("specific case: first buffer has all bytes zeroes", () => {

        makeSpecificBufferCase(
            "0000".repeat( 3 ),
            "9535f8a234"
        );

    })

    it("specific case: first buffer has 1 empty byte", () => {

        makeSpecificBufferCase(
            "00da8e86f790e47ee21160ce1ad7c51f89b81c57e74d6de2758af3b4ebdaa4515e1637476778a7be6b36ba6207deac3499ad5d090358c2f385e86503ade45914ac942a699c2f",
            "325c2fdef283119a68f0c13a"
        );

    })

    it("specific case: second buffer has 1 empty byte", () => {

        makeSpecificBufferCase(
            "37a84418988ee6062a7ca2906a2387c629bbac108ef233afe8abeb6561a474e2",
            "00a38f548cc22a35a0382e851479674af9eb"
        );

    })

    it("specific case: first buffer has one starting zero", () => {

        makeSpecificBufferCase(
            "4d1ace10a2e93dbc74de0c8d0538ac22cf76e6b1e9f146cf30f701bd079bb4d0bdfb65458fc7711982199cb549de13096f247d41a5e63c8e9de04a2299e91f42f92687a3e11ace11b96a70c15d273f4784dec287d7f9a68496de2c318581ca746c8b9ba8289f27f6db7aa389509274409ffc2269",
            "1f35af85ae3c98d386fb1758f461bfca1daaa0e2d62358bb2dc438fa5fc0aa871fbbc1a8de2f826257ce61931371ed0fb74b82b571fc830e0f54886e929a633c93ea1a66702e576319b869e1aa137a4031728aa277f0ca82c24ddcc73a5f2ac28dc39125e7bd2a34d832c51cc4e1b6cf375bb3c3f97d47b283e2cf11492c"
        );

    });

    it("specific case: both nInitialZeroes === 0", () => {

        makeSpecificBufferCase(
            "789788a4e347",
            "98f7235b25f4b1fec898cf566c416935748c46536768"
        );

    })

    it("specific case: second.isAllZeroes() === true", () => {

        makeSpecificBufferCase(
            "69fc058cc9de32ce8e0537d37f83a8df0365e9342ed1480d4cacdb32a75d2302c1974aceae7e2f69466ddaf5b815058432f5dfed5f4d66919f51461ee831cd0aa765b42da28a22157e93eb9f36584d250a362d6da032bf8807",
            "00"
        );

    })

})

describe("BitStream.append both inputs generated from bigints", () => {

    it("appends of BitStreams generated by bigints are just fine",() => {

        let bInt1 : bigint;
        let bInt2 : bigint;

        let bits1 : BitStream;
        let bits2 : BitStream;


        for(let i = 0; i < 1000; i++ )
        {
            bInt1 = BigIntUtils.random();
            bits1 = new BitStream( bInt1 );

            bInt2 = BigIntUtils.random();
            bits2 = new BitStream( bInt2 );

            Debug.ignore.log( 
                `big int 1: ${bInt1.toString( 16 )}`,
                `big int 2: ${bInt2.toString( 16 )}`
            )

            bits1.append( bits2 );

            // the first buffer can have initial zeroes (not counted in bigint representation)
            // causing a shift in the final buffer
            const { bigint: trackedBigInt, nInitialZeroes } = bits1.asBigInt()

            let manuallyAppended = bInt1 << BigInt( BitUtils.getNOfUsedBits( bInt2 ) );
            manuallyAppended = manuallyAppended | bInt2;

            expect( 
                trackedBigInt
            ).toEqual(
                manuallyAppended
            )

            expect(
                nInitialZeroes
            ).toEqual(
                bits1.nInitialZeroes
            )
            
        }

    });

})