import Type, { LambdaType, PrimType, TermType } from ".."
import { restrictExtensionWith, typeExtends } from "../utils"

describe("restrictExtensionWith", () => {

    test("documentation example", () => {

        expect(
            restrictExtensionWith( Type.Int, Type.Var() ) // -> Type.Int
        ).toEqual( Type.Int );

        expect(
            typeExtends(
                restrictExtensionWith(
                    Type.Pair( Type.Int, Type.Var("something") ),
                    Type.Pair( Type.Var("a"), Type.Var("b") )
                ) as any, // -> Type.Pair( Type.Int, Type.Var("some_other_b") )
                Type.Pair( Type.Int, Type.Var("some_other_b") )
            )
        ).toBe( true );

        expect(
            restrictExtensionWith(
                Type.Pair( Type.Int, Type.Int ),
                Type.Pair( Type.Var("a"), Type.Var("b") )
            ) // -> Type.Pair( Type.Int, Type.Int )
        ).toEqual( Type.Pair( Type.Int, Type.Int ) );

        const same_a = Type.Var("same_a");
        expect(
            restrictExtensionWith(
                Type.Pair( Type.Int, Type.Any ),
                Type.Pair( same_a , same_a  )
            ) // -> Type.Pair( Type.Int, Type.Int )
        ).toEqual( undefined );

        expect(
            restrictExtensionWith(
                Type.Str,
                Type.Int
            ) // -> undefined // first type cannot be assigned to the second
        ).toBe( undefined );

        expect(
            restrictExtensionWith(
                Type.Pair( Type.Int, Type.Any ),
                Type.Pair( Type.Int, Type.Int )
            ) // -> undefined // first type cannot be assigned to the second
        ).toBe( undefined )

    });

    test("generic lambda", () => {
        
        const a = Type.Var("a");
        const b = Type.Var("b");

        const genericLam = Type.Lambda( a, b );

        function tyEq( t1: TermType | undefined, t2: TermType ): boolean
        {
            if( t1 === undefined ) return false;
            return typeExtends( t1, t2 ) && typeExtends( t2, t1 );
        }

        function testGenericLam( someLambda: [ PrimType.Lambda, TermType, TermType ] | LambdaType<TermType, TermType> )
        {
            expect(
                tyEq(
                    restrictExtensionWith(
                        someLambda,
                        genericLam
                    ),
                    someLambda
                )
            ).toBe( true );
        }
        
        testGenericLam( Type.Lambda( Type.Int, Type.Unit ) );
        testGenericLam( Type.Lambda( Type.Int, Type.Any ) );
        testGenericLam( Type.Lambda( Type.Any, Type.Unit ) );
        testGenericLam( Type.Lambda( Type.Any, Type.Any ) );

        testGenericLam( Type.Fn([ Type.Int, Type.Str ], Type.Unit ) );

        testGenericLam( Type.Fn([ Type.Any, Type.Str ], Type.Unit ) );
        testGenericLam( Type.Fn([ Type.Int, Type.Any ], Type.Unit ) );
        testGenericLam( Type.Fn([ Type.Int, Type.Str ], Type.Any ) );

        const c = Type.Var("c");
        const d = Type.Var("d");

        testGenericLam( Type.Fn([ Type.Int, c ], c) );
        testGenericLam( Type.Fn([ c, Type.Str ], c ) );

        testGenericLam( Type.Fn([ c, d ], c ) );
        testGenericLam( Type.Fn([ c, d ], d ) );


    })
})