import { pfindList } from ".."
import evalScript from "../../../../CEK"
import { showUPLC } from "../../../../UPLC/UPLCTerm"
import { pInt } from "../../../PTypes/PInt"
import { pList } from "../../../PTypes/PList"
import { int } from "../../../Term/Type"
import { peqInt } from "../../Builtins"
import PMaybe from "../../PMaybe"

describe("pfindList", () => {

    test("finds '1' in [1,2,3,4,5]", () => {

        console.log(
            showUPLC(
                pfindList( int )
                .$(
                    peqInt.$( pInt( 1 ) )
                )
                .$( pList( int )([1,2,3,4,5].map( pInt ) ) )
                .toUPLC( 0 )
            )
        )

        const expected = evalScript(
            PMaybe( int ).Just({ val: pInt( 1 ) })
        )

        expect(
            evalScript(
                pfindList( int )
                .$(
                    peqInt.$( pInt( 1 ) )
                )
                .$( pList( int )([1,2,3,4,5].map( pInt ) ) )
            )
        ).toEqual(
            expected
        )

    });

    test("finds '2' in [1,2,3,4,5]", () => {

        const expected = evalScript(
            PMaybe( int ).Just({ val: pInt( 2 ) })
        )

        expect(
            evalScript(
                pfindList( int )
                .$(
                    peqInt.$( pInt( 2 ) )
                )
                .$( pList( int )([1,2,3,4,5].map( pInt ) ) )
            )
        ).toEqual(
            expected
        )

    })

    test.skip("finds '5' in [1,2,3,4,5]", () => {

        const expected = evalScript(
            PMaybe( int ).Just({ val: pInt( 5 ) })
        )

        expect(
            evalScript(
                pfindList( int )
                .$(
                    peqInt.$( pInt( 5 ) )
                )
                .$( pList( int )([1,2,3,4,5].map( pInt ) ) )
            )
        ).toEqual(
            expected
        )

    })
})