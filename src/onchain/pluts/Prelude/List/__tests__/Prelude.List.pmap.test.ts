import { pmap, _pmap } from ".."
import evalScript from "../../../../CEK"
import { showUPLC } from "../../../../UPLC/UPLCTerm"
import ErrorUPLC from "../../../../UPLC/UPLCTerms/ErrorUPLC"
import { pInt } from "../../../PTypes/PInt"
import { pList } from "../../../PTypes/PList"
import compile from "../../../Script/compile"
import { int } from "../../../Term/Type"
import { padd } from "../../Builtins"


describe("pmap", () => {

    test("addTwo", () => {

        const addTwo = _pmap( int, int ).$( padd.$( pInt(2) ) );

        console.log(
            showUPLC(
                addTwo.$( pList( int )([1,2,3].map( pInt ) ) )
                .toUPLC(0)
            )
        );
        
        expect(
            evalScript(
                addTwo.$( pList( int )([1,2,3].map( pInt ) ) )
            )
        ).toEqual(
            evalScript(
                pList( int )([3,4,5].map( pInt ) )
            )
        )
    })
})