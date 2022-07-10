import Integer, { ZigZagInteger } from ".."
import BitUtils from "../../../../utils/BitUtils";
import Debug from "../../../../utils/Debug";


describe("ZigZag to Integer conversion", () => {

    it("0 back to integer is 0", () => {

        expect( 
            Integer.fromZigZag(
                ZigZagInteger.fromNumber( 0 )
            ).asBigInt 
        ).toBe( 
            BigInt( 0 ) 
        );

    })

    it("even numbers are positive",() => {

        let num: number = 1;
        let decodedInteger: bigint;

        for( let i = 0; i < 1000; i++)
        {
            //reset 
            num = 1;

            while( num % 2 !== 0 )
            {
                num = Math.round(
                    (Math.random() + Number.MIN_VALUE )* Number.MAX_SAFE_INTEGER 
                );
            }
            // num is even now

            decodedInteger = Integer.fromZigZag(
                ZigZagInteger.fromAlreadyZigZagged( BigInt( num ) )
            ).asBigInt 

            expect( 
                decodedInteger
            ).toBeGreaterThan( 
                BigInt( 0 ) 
            );

            expect( 
                decodedInteger
            ).toBe( 
                BigInt( num / 2 ) 
            );
        }


        let bigint: bigint = BigInt( 1 );

        for( let i = 0; i < 1000; i++)
        {
            // while last bit !== 0
            // same of module 2
            while( ( bigint & BigInt(1) ) !== BigInt(0) )
            {
                bigint = BigInt(
                    Math.round(
                        (Math.random() + Number.MIN_VALUE ) * Number.MAX_SAFE_INTEGER 
                    )
                );
                bigint = bigint << BigInt( BitUtils.getNOfUsedBits( bigint ) );
                bigint = bigint | BigInt(
                    Math.round(
                        (Math.random() + Number.MIN_VALUE ) * Number.MAX_SAFE_INTEGER 
                    )
                );
            }

            decodedInteger = Integer.fromZigZag(
                ZigZagInteger.fromAlreadyZigZagged( BigInt( bigint ) )
            ).asBigInt 

            expect( 
                decodedInteger
            ).toBeGreaterThan( 
                BigInt( 0 ) 
            );

            expect( 
                decodedInteger
            ).toBe( 
                // integer division by 2
                bigint >> BigInt( 1 ) 
            );
        
            // reset
            bigint = BigInt( 1 );
        }

    })

    it("odd numbers are negative", () => {

        let num: number = 0;
        let decodedInteger: bigint;

        for( let i = 0; i < 1000; i++)
        {
            //reset
            num = 0;

            while( (num % 2) !== 1 )
            {
                num = Math.round(
                    Math.random() * Number.MAX_SAFE_INTEGER 
                );
            }
            // num is odd now

            decodedInteger = Integer.fromZigZag(
                ZigZagInteger.fromAlreadyZigZagged( BigInt( num ) )
            ).asBigInt 

            expect( 
                decodedInteger
            ).toBeLessThan( 
                BigInt( 0 ) 
            );

            expect( 
                decodedInteger
            ).toBe( 
                BigInt( - (num - 1) / 2 )
                -BigInt(1) 
            );
        }

        ///*
        let bigint: bigint;

        decodedInteger = Integer.fromZigZag(
            ZigZagInteger.fromAlreadyZigZagged( BigInt( num ) )
        ).asBigInt 

        for( let i = 0; i < 1000; i++)
        {
            // reset
            bigint = BigInt( 0 );

            // while last bit !== 0
            // same of module 2
            while( ( bigint & BigInt(1) ) !== BigInt(1) )
            {
                bigint = BigInt(
                    Math.round(
                        (Math.random() + Number.MIN_VALUE ) * Number.MAX_SAFE_INTEGER 
                    )
                );
                bigint = bigint << BigInt( BitUtils.getNOfUsedBits( bigint ) );
                bigint = bigint | BigInt(
                    Math.round(
                        (Math.random() + Number.MIN_VALUE ) * Number.MAX_SAFE_INTEGER 
                    )
                );
            }
            // bigint is now odd

            decodedInteger = Integer.fromZigZag(
                ZigZagInteger.fromAlreadyZigZagged( bigint )
            ).asBigInt 


            expect( 
                decodedInteger
            ).toBeLessThan( 
                BigInt( 0 ) 
            );

            expect( 
                decodedInteger
            ).toBe( 
                ( - (bigint - BigInt(1)) / BigInt(2) )
                -BigInt(1) 
            );

        }
        //*/

    })
})