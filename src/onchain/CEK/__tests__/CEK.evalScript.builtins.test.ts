import evalScript from ".."
import { pInt } from "../../pluts/PTypes/PInt"
import ErrorUPLC from "../../UPLC/UPLCTerms/ErrorUPLC";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst"
import { haskellDiv, haskellQuot, haskellRem } from "../BnCEK";


describe("CEK :: evalScript ; builtins", () => {

    describe("addInteger", () => {

        function test_add( a: number, b: number )
        {
            test.concurrent(`${a} + ${b} = ${ a + b }`, () => {
                expect(
                    evalScript(
                        pInt( a ).add.$( pInt( b ) )
                        .toUPLC(0)
                    )
                ).toEqual( UPLCConst.int( a + b ) );
            })
        }

        test_add( 0 , 0 );
        test_add( 1 , 0 );
        test_add( 1 , 2 );
        test_add( -0 , 0 );
        test_add( -1 , 0 );
        test_add( -1 , 1 );
        test_add( -1 , -2 );

    });

    describe("subtractInteger", () => {

        function test_sub( a: number, b: number )
        {
            test.concurrent(`${a} - ${b} = ${ a - b }`, () => {
                expect(
                    evalScript(
                        pInt( a ).sub.$( pInt( b ) )
                        .toUPLC(0)
                    )
                ).toEqual( UPLCConst.int( a - b ) );
            })
        }

        test_sub( 0 , 0 );
        test_sub( 1 , 0 );
        test_sub( 1 , 2 );
        test_sub( -0 , 0 );
        test_sub( -1 , 0 );
        test_sub( 0 , -1 );
        test_sub( 0 ,  1 );
        test_sub( -1 , -2 );

    });

    describe("multiplyInteger", () => {

        function test_mult( a: number, b: number )
        {
            test.concurrent(`${a} * ${b} = ${ a * b }`, () => {
                expect(
                    evalScript(
                        pInt( a ).mult.$( pInt( b ) )
                        .toUPLC(0)
                    )
                ).toEqual( UPLCConst.int( a * b ) );
            })
        }

        test_mult( 0 , 0 );
        test_mult( 1 , 0 );
        test_mult( 1 , 2 );
        test_mult( -0 , 0 );
        test_mult( -1 , 0 );
        test_mult( 0 , -1 );
        test_mult( 1 ,  1 );
        test_mult( -1 , -2 );
        test_mult( 3 ,  3 );
        test_mult( 3 ,  4 );
        test_mult( -3 ,  4 );
    })

    describe("divideInteger", () => {

        function test_div( a: number, b: number, expected: undefined | number = undefined )
        {
            const result = expected ?? haskellDiv( BigInt(a), BigInt(b) );

            test.concurrent(`${a} \`div\` ${b} = ${ result ?? "UPLC error" }`, () => {
                const plutsRes = evalScript(
                    pInt( a ).div.$( pInt( b ) )
                    .toUPLC(0)
                )

                if( result === undefined )
                {
                    expect( plutsRes instanceof ErrorUPLC ).toBe( true );
                }
                else
                    expect(
                        plutsRes
                    ).toEqual( UPLCConst.int( result ) );
            })
        }

        test_div( 0 , 0 );
        test_div( 1 , 0 );
        test_div( 1 , 2 );
        test_div( -0 , 0 );
        test_div( -1 , 0 );
        test_div( 0 , -1 );
        test_div( 1 ,  1 );
        test_div( -1 , -2 );
        test_div( 3 ,  3 );
        test_div( 3 ,  4 );
        test_div( -3 ,  4 );
        test_div( 20 ,  3, 6);
        test_div( 20 ,  -3, -7 );

    })

    describe("quotientInteger", () => {

        function test_div( a: number, b: number, expected: undefined | number = undefined )
        {
            const result = expected ?? haskellQuot( BigInt(a), BigInt(b) );

            test.concurrent(`${a} \`quot\` ${b} = ${ result ?? "UPLC error" }`, () => {

                const plutsRes = evalScript(
                    pInt( a ).quot.$( pInt( b ) )
                    .toUPLC(0)
                );

                if( result === undefined )
                {
                    expect( plutsRes instanceof ErrorUPLC ).toBe( true );
                }
                else
                    expect(
                        plutsRes
                    ).toEqual( UPLCConst.int( result ) );
            })
        }

        test_div( 0 , 0 );
        test_div( 1 , 0 );
        test_div( 1 , 2 );
        test_div( -0 , 0 );
        test_div( -1 , 0 );
        test_div( 0 , -1 );
        test_div( 1 ,  1 );
        test_div( -1 , -2 );
        test_div( 3 ,  3 );
        test_div( 3 ,  4 );
        test_div( -3 ,  4 );
        test_div( 20 ,  3, 6);
        test_div( 20 ,  -3, -6 );

    })

    describe("remainderInteger", () => {

        function test_rem( a: number, b: number, expected: undefined | number = undefined )
        {
            const result = expected ?? haskellRem( BigInt(a), BigInt(b) );

            test.concurrent(`${a} \`rem\` ${b} = ${ result ?? "UPLC error" }`, () => {

                const plutsRes = evalScript(
                    pInt( a ).remainder.$( pInt( b ) )
                    .toUPLC(0)
                );

                if( result === undefined )
                {
                    expect( plutsRes instanceof ErrorUPLC ).toBe( true );
                }
                else
                {
                    expect( plutsRes ).toEqual( UPLCConst.int( result ) );
                }
            })
        }

        test_rem( 0 , 0 );
        test_rem( 1 , 0 );
        test_rem( 1 , 2 );
        test_rem( -0 , 0 );
        test_rem( -1 , 0 );
        test_rem( 0 , -1 );
        test_rem( 1 ,  1 );
        test_rem( -1 , -2 );
        test_rem( 3 , 3 );
        test_rem( 3 , 4 );
        test_rem( -3 , 4 );
        test_rem( 20 , 3, 2 );
        test_rem( 20 , -3, 2 );

    })

})