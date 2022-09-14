import Type from "..";
import { typeExtends } from "../utils";



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

    describe("tyParams", () => {

        test("single TyParam works as 'Type.Any'", () => {

            allTypes.forEach( t => {
                expect( typeExtends( t, Type.Var() ) ).toBe( true );
                expect( typeExtends( t, Type.Any ) ).toBe( true );
            });

        });

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

            test("same tyVar, constraints to the most generic", () => {

                allTypes.forEach( t1 => {

                    allTypes.forEach( t2 => {
                        
                        const sameTyVar = Type.Var("same");

                        expect(
                            typeExtends( 
                                Type.Pair( t1, t2 ),
                                Type.Pair( sameTyVar, sameTyVar )
                            )
                        // false if the types are not related
                        // true if eiter one extends the other
                        ).toBe( typeExtends( t2, t1 ) || typeExtends( t1, t2 ) );

                    });
                    
                });

            });

            test("same tyVar, constraints to the most generic, different tyVar is unrelated", () => {

                allTypes.forEach( t1 => {

                    allTypes.forEach( t2 => {

                        const sameTyVar = Type.Var("same");
                        
                        allTypes.forEach( t3 => {
                        
                            const otherTyVar = Type.Var("other");
    
                            // false if the types are not related
                            // true if eiter one extends the other
                            // third type doesn't matter since unrelated
                            const expected = typeExtends( t2, t1 ) || typeExtends( t1, t2 );

                            expect(
                                typeExtends( 
                                    Type.Pair( t1, Type.Pair( t3, t2 ) ),
                                    Type.Pair( sameTyVar, Type.Pair( otherTyVar, sameTyVar ) )
                                )
                            ).toBe( expected );

                            expect(
                                typeExtends( 
                                    Type.Pair( t1, Type.Pair( t3, t2 ) ),
                                    Type.Pair( sameTyVar, Type.Pair( Type.Any, sameTyVar ) )
                                )
                            ).toBe( expected );
    
                        });

                    });
                    
                });

            });

        });

    });

})