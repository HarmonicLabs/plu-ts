import Integer from ".."
import BitUtils from "../../../../utils/BitUtils";


describe("Integer to ZigZag conversion", () => {

    it("0 zigzagged is 0", () => {

        expect( new Integer(0).toZigZag().asBigInt ).toBe( BigInt( 0 ) );

    })

    it("positive integers are doubled",() => {

        let num: number

        for( let i = 0; i < 1000; i++)
        {
            num = Math.round(
                Math.random() * Number.MAX_SAFE_INTEGER 
            );
            expect( new Integer( num ).toZigZag().asBigInt ).toBe( BigInt( num ) * BigInt( 2 ) );
        }

        let bigint: bigint

        for( let i = 0; i < 1000; i++)
        {
            bigint = BigInt(
                Math.round(
                    Math.random() * Number.MAX_SAFE_INTEGER 
                )
            );
            bigint = bigint << BigInt( BitUtils.getNOfUsedBits( bigint ) );
            bigint = bigint | BigInt(
                Math.round(
                    Math.random() * Number.MAX_SAFE_INTEGER 
                )
            );

            expect( bigint > BigInt( 0 ) ).toBe( true );

            expect( new Integer( bigint ).toZigZag().asBigInt ).toBe( bigint * BigInt( 2 ) );
        }

    })

    it("negative integers are positive odd numbers (\\negInt -> ((-negIng) * 2) - 1 )", () => {

        let num: number

        for( let i = 0; i < 1000; i++)
        {
            num = Math.round(
                Math.random() * Number.MIN_SAFE_INTEGER 
            );

            expect( new Integer( num ).toZigZag().asBigInt ).toBe( BigInt( -num ) * BigInt( 2 ) - BigInt(1) );
        }

        let bigint: bigint

        for( let i = 0; i < 1000; i++)
        {
            bigint = BigInt(
                Math.round(
                    Math.random() * Number.MIN_SAFE_INTEGER 
                )
            );
            bigint = bigint << BigInt( BitUtils.getNOfUsedBits( bigint ) );
            bigint = bigint | BigInt(
                Math.round(
                    Math.random() * Number.MIN_SAFE_INTEGER 
                )
            );

            expect( bigint < BigInt( 0 ) ).toBe( true );

            const zigzagged = new Integer( bigint ).toZigZag().asBigInt;

            expect( zigzagged ).toBeGreaterThan( BigInt( 0 ) );

            expect(
                zigzagged
            ).toBe(
                ( ( -bigint ) * BigInt( 2 ) ) - BigInt( 1 )
            );
        }

    })

})