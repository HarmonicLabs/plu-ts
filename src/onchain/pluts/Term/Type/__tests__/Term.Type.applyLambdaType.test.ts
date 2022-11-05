import Type, { TypeShortcut } from "../base"
import applyLambdaType from "../applyLambdaType"

const { pair, lam, int, str } = TypeShortcut;

describe("applyLambdaType", () => {

    test("fixed type is fine", () => {

        expect(
            applyLambdaType(
                lam( int, int ),
                int
            )
        ).toEqual( int )

    })

    test("throws on wrong input type", () => {

        expect(
            () => applyLambdaType(
                lam( int, int ),
                str
            )
        ).toThrow()

    })

    test("single parametrized types are substituted", () => {

        const a = Type.Var("a");

        const idType = lam( a, a );

        expect(
            applyLambdaType(
                idType,
                int
            )
        ).toEqual( int )

        expect(
            applyLambdaType(
                idType,
                str
            )
        ).toEqual( str )

        const b = Type.Var("b");

        expect(
            applyLambdaType(
                idType,
                b
            )
        ).toEqual( b )
    })
    

    test("multi paramteter types substitute only interested", () => {

        const a = Type.Var("a");
        const b = Type.Var("b");
        const c = Type.Var("c");

        expect(
            applyLambdaType(
                lam( a, lam( b, a ) ),
                int
            )
        ).toEqual( lam( b, int ) )

        expect(
            applyLambdaType(
                lam( pair( a, c ), lam( b, lam( a, c ) ) ),
                pair( int, str )
            )
        ).toEqual( lam( b, lam( int, str ) ) )

    })
})