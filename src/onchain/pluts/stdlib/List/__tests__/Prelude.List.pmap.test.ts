import { pmap } from "../methods"
import evalScript from "../../../../CEK"
import { showUPLC } from "../../../../UPLC/UPLCTerm"
import { pInt } from "../../../PTypes/PInt"
import { pList } from "../../../PTypes/PList"
import { plam } from "../../../Syntax/syntax"
import { int } from "../../../Term/Type/base"
import { padd } from "../../Builtins"


describe("pmap", () => {

    const expected = evalScript(
        pList( int )([3,4,5].map( pInt ) )
    );

    test("addTwo", () => {

        const addTwo = pmap( int, int ).$( padd.$( pInt(2) ) );

        expect(
            evalScript(
                addTwo.$( pList( int )([1,2,3].map( pInt ) ) )
            )
        ).toEqual(
            expected
        )
    });

    test("addTwo lam", () => {

        const addTwo = pmap( int, int ).$( plam( int, int )( x => pInt(2).add( x ) ) );

        expect(
            evalScript(
                addTwo.$( pList( int )([1,2,3].map( pInt ) ) )
            )
        ).toEqual(
            expected
        )
    });

})