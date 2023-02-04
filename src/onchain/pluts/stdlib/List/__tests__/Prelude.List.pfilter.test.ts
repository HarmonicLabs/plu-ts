import { pfilter } from ".."
import { evalScript } from "../../../../CEK"
import { pInt, pList } from "../../../PTypes"
import { plam } from "../../../Syntax"
import { bool, int } from "../../../Term/Type"

describe("pfilter", () => {

    const arr = (new Array(10))
    .fill( undefined )
    .map((_, i) => i + 1 );

    const evens = arr.filter( n => (n % 2) === 0 );
    const odds = arr.filter( n => (n % 2) === 1 );

    test(`filter (\\ x -> x \`mod\` 2 == 0 ) [1..10] == [${evens}]`, () => {

        const getEven = pfilter( int )
        .$(
            plam( int, bool )
            ( n => n.mod( pInt(2) ).eq( pInt(0) ) )
        );

        expect(
            evalScript(
                getEven.$( pList( int )( arr.map( pInt ) ) )
            )
        ).toEqual(
            evalScript(
                pList( int )(
                    evens.map( pInt )
                )
            )
        );

    });

    test(`filter (\\ x -> x \`mod\` 2 == 1 ) [1..10] == [${odds}]`, () => {

        const getOdds = pfilter( int )
        .$(
            plam( int, bool )
            ( n => n.mod( pInt(2) ).eq( pInt(1) ) )
        );

        expect(
            evalScript(
                getOdds.$( pList( int )( arr.map( pInt ) ) )
            )
        ).toEqual(
            evalScript(
                pList( int )(
                    odds.map( pInt )
                )
            )
        );

    });

})