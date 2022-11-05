import Type, { int, pair, TermType } from "../base";
import PValue from "../../../API/V1/Value";
import palias from "../../../PTypes/PAlias/palias";
import { typeExtends } from "../extension";
import { termTypeToString } from "../utils";

const allTypesFixed = [
    Type.Unit,
    Type.Int,
    Type.BS,
    Type.Bool,
    Type.Delayed( Type.Int ),
    Type.Lambda( Type.Unit, Type.Int ) as any,
    Type.Fn([ Type.Unit, Type.Str, Type.Int ], Type.Map( Type.Str, Type.Data.BS ) ) as any,
    Type.List( Type.Bool ),
    Type.Map( Type.BS, Type.Map( Type.BS, Type.Int )),
    Type.Pair( Type.Str, Type.Int ),
    Type.Data.BS,
    Type.Data.Int,
    Type.Data.Constr,
] as const;

const allTypes = [
    Type.Any,
    Type.Var(),
    ...allTypesFixed
] as const;

describe("typeExtends", () => {

    test("same type is true", () => {

        allTypes.forEach( t => {
            expect( typeExtends( t, t ) ).toBe(true)
        });

    })

    describe("tyParams", () => {

        test("single TyParam works as 'Type.Any'", () => {

            allTypes.forEach( t => {
                expect( typeExtends( t, Type.Var() ) ).toBe( true );
                expect( typeExtends( t, Type.Any ) ).toBe( true );
            });

        });

        test("same typeParam", () => {

            const sameTy = Type.Var("same type paramteter");

            function testSameTyParam( t: TermType, expected: boolean = true ): void
            {
                // console.log( termTypeToString( t ) )
                expect(
                    typeExtends(
                        t,
                        Type.Pair( sameTy, sameTy )
                    )
                ).toBe(expected)
            }

            allTypes.forEach( t => {
                testSameTyParam( Type.Pair( t, t ) )
            });

            testSameTyParam( Type.Pair( Type.Int, Type.Str ), false );
            
            testSameTyParam( Type.Pair( Type.Int, Type.Any ), false );
            testSameTyParam( Type.Pair( Type.Any, Type.Any ), false );
            testSameTyParam( Type.Pair( Type.Any, Type.Int ), false );

        })

        describe("multiple params", () => {

            test("unrelated tyVar acts as 'Type.Any'", () => {

                allTypes.forEach( t1 => {

                    allTypes.forEach( t2 => {
                        expect(
                            typeExtends( 
                                Type.Pair( t1, t2 ),
                                Type.Pair( Type.Var(1), Type.Var(2) )
                            )
                        ).toBe( true );
                        expect(
                            typeExtends( 
                                Type.Pair( t1, t2 ),
                                Type.Pair( Type.Any, Type.Any )
                            )
                        ).toBe( true );
                    });

                });

            });

        });

    });

    describe("palias", () => {

        const FancyInt = palias( int );
        const FancyierInt = palias( int );

        test("alias can be assigned to original", () => {

            expect(
                typeExtends(
                    FancyInt.type,
                    int
                )
            ).toBe( true );

        });

        test("original can't be assigned to alias", () => {

            expect(
                typeExtends(
                    int,
                    FancyInt.type
                )
            ).toBe( false );

        });

        test("different aliases of same original are different things", () => {

            expect(
                typeExtends(
                    FancyierInt.type,
                    FancyInt.type
                )
            ).toBe( false );

            expect(
                typeExtends(
                    FancyInt.type,
                    FancyierInt.type
                )
            ).toBe( false );

        });

        test("same alias is ok", () => {

            expect(
                typeExtends(
                    FancyInt.type,
                    FancyInt.type
                )
            ).toBe( true );

            expect(
                typeExtends(
                    FancyierInt.type,
                    FancyierInt.type
                )
            ).toBe( true );

        });

    })

    test.only("pair( any, any )", () => {

        expect(
            typeExtends(
                PValue.type[1].type[1],
                pair( Type.Any, Type.Any )
            )
        ).toBe( true );

    })

})