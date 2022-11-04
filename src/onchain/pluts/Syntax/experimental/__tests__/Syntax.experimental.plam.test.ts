import evalScript from "../../../../CEK"
import UPLCConst from "../../../../UPLC/UPLCTerms/UPLCConst"
import PInt, { pInt } from "../../../PTypes/PInt"
import { pStr } from "../../../PTypes/PString"
import Term from "../../../Term"
import { plam } from "../plam"

describe("unspecified type plam", () => {

    test.skip("throws on improper types", () => {

        const addTwo = plam( (x: Term<PInt>) => pInt(2).add.$( x ) );

        expect(
            evalScript(
                addTwo.$( pInt( 3 ) )
            )
        ).toEqual( UPLCConst.int( 5 ) );

        expect(
            () => addTwo.$( pStr("NaN") as any )
        ).toThrow()
    })
})