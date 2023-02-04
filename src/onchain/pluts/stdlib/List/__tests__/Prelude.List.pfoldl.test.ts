import { evalScript } from "../../../../CEK"
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst"
import { pList, pnil } from "../../../PTypes"
import { pInt } from "../../../PTypes/PInt"
import { int, list } from "../../../Term/Type"
import { pprepend, psub } from "../../Builtins"
import { pflip } from "../../PCombinators"
import { pfoldl } from "../methods"


describe("pfoldl", () => {

    test("foldl (-) 0 [1..10] = -55; left associative", () => {

        const expr = pfoldl( int, int )
        .$( psub )
        .$( pInt( 0 ) )
        .$(
            pList( int )
            (
                (new Array(10))
                .fill( undefined )
                .map((_, i) => pInt( i + 1 ))
            )
        );

        expect(
            evalScript(
                expr
            )
        ).toEqual(
            UPLCConst.int(
                (((((((((0-1)-2)-3)-4)-5)-6)-7)-8)-9)-10
            )
        )
    });

    test('foldl (flip (:)) [] == reverseFunc', () => {

        const arr = (new Array(10))
        .fill( undefined )
        .map((_, i) => pInt( i + 1 ));

        const expr = pfoldl( int, list( int ) )
        .$( pflip.$( pprepend( int ) ) )
        .$( pnil( int ) )
        .$( pList( int )( arr ) );

        expect(
            evalScript(
                expr
            )
        ).toEqual(
            evalScript(
                pList( int )
                ( arr.map( x => x ).reverse() )
            )
        );
        
    })

})