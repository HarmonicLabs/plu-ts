import Type, { TermType } from "..";
import { termTypeToString, termTyToConstTy, typeExtends } from "../utils";



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
                console.log( termTypeToString( t ) )
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

})