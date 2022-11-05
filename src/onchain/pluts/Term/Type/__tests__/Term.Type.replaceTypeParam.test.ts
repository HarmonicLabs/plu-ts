import Type, { FixedTermType, TermType } from "../base"
import { replaceTypeParam } from "../tyParams";


describe("replaceTypeParam", () => {

    const substitutes = [
        Type.Unit,
        Type.Int,
        Type.BS,
        Type.Bool,
        Type.Delayed( Type.Int ),
        Type.Data.BS,
        Type.Data.Int,
        Type.Data.Constr,
        Type.Lambda( Type.Unit, Type.Int ) as any,
        Type.Fn([ Type.Unit, Type.Str, Type.Int ], Type.Map( Type.Str, Type.Data.BS ) ) as any
    ] as const;

    test("no tyParams => no replace", () => {

        function noReplaceTest( t: TermType ): void
        {
            expect(
                replaceTypeParam( Type.Var() , Type.Int, t )
            ).toEqual( t )

        }

        noReplaceTest( Type.Int );
        noReplaceTest( Type.BS );
        noReplaceTest( Type.List( Type.Int ) );
        noReplaceTest( Type.Map( Type.Str, Type.Unit ) );
        noReplaceTest( Type.Lambda( Type.List( Type.Int ), Type.Int ) );
        noReplaceTest( Type.Fn([ Type.Int, Type.Pair( Type.Any, Type.Any ) ], Type.Any ) );

        noReplaceTest( Type.Var() ); // different typeVar

    });

    test("single tyParams is removed", () => {

        function idTest( ty: Readonly<FixedTermType> )
        {
            const tyVar = Type.Var()[0]
            expect(
                replaceTypeParam( tyVar , ty, [ tyVar ] )
            ).toEqual( ty )
        }

        substitutes.forEach( idTest );

        function listTest( ty: Readonly<FixedTermType> )
        {
            const tyVar = Type.Var()
            expect(
                replaceTypeParam( tyVar , ty, Type.List( tyVar ) )
            ).toEqual( Type.List( ty ) )
        }

        substitutes.forEach( listTest );

        function lambdaTest( ty: Readonly<FixedTermType> )
        {
            const tyVar = Type.Var()
            expect(
                replaceTypeParam( tyVar , ty, Type.Lambda( Type.Unit, tyVar ) )
            ).toEqual( Type.Lambda( Type.Unit, ty ) )
        }

        substitutes.forEach( lambdaTest );

        function nestedListTest( ty: Readonly<FixedTermType> )
        {
            const tyVar = Type.Var()
            expect(
                replaceTypeParam( tyVar , ty, Type.List( Type.List( tyVar ) ) )
            ).toEqual( Type.List( Type.List( ty ) ) )
        }

        substitutes.forEach( nestedListTest );

        function higherOrderTest( ty: Readonly<FixedTermType> )
        {
            const tyVar = Type.Var()
            expect(
                replaceTypeParam( tyVar , ty, Type.Fn([Type.Lambda( tyVar, Type.Int )], tyVar ) )
            ).toEqual( Type.Fn([Type.Lambda( ty, Type.Int )], ty ) )
        }

        substitutes.forEach( higherOrderTest );

    })

    test("multi tyParams removes only interessed", () => {

        function pairTest( ty: Readonly<FixedTermType> )
        {
            const tyVar1 = Type.Var();
            const tyVar2 = Type.Var();
            expect(
                replaceTypeParam( tyVar1 , ty, Type.Pair( tyVar1, tyVar2 ) )
            ).toEqual( Type.Pair( ty, tyVar2 ) );

            expect(
                replaceTypeParam( tyVar2 , ty, Type.Pair( tyVar1, tyVar2 ) )
            ).toEqual( Type.Pair( tyVar1, ty ) );

        }

        substitutes.forEach( pairTest );

        function higherOrderTest( ty: Readonly<FixedTermType> )
        {
            const tyVar1 = Type.Var();
            const tyVar2 = Type.Var();
            expect(
                replaceTypeParam( tyVar1 , ty, Type.Fn([Type.Lambda( tyVar1, tyVar2 )], tyVar1 ) )
            ).toEqual( Type.Fn([Type.Lambda( ty, tyVar2)], ty ) );

            expect(
                replaceTypeParam( tyVar2 , ty, Type.Fn([Type.Lambda( tyVar1, tyVar2 )], tyVar1 ) )
            ).toEqual( Type.Fn([Type.Lambda( tyVar1, ty)], tyVar1 ) );
        }

        substitutes.forEach( higherOrderTest );

    })

    
})