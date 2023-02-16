import { Term } from ".."
import { UPLCVar } from "../../../UPLC/UPLCTerms/UPLCVar"
import { pgreaterInt } from "../../lib/builtins/int/intBinOpToBool"
import { phoist } from "../../lib/phoist"
import { pInt } from "../../lib/std/int/pInt"
import { int } from "../../type_system"


describe("phoist", () => {

    it("keeps Term's properties", () => {

        /**
         * ```pgreaterInt``` definition:
         * ```ts
         *  phoist(
         *      pfn<[ PInt , PInt ], PBool>([ Type.Int, Type.Int ], Type.Bool )(
         *          ( a: Term<PInt>, b: Term<PInt> ): TermBool => plessInt.$( b ).$( a )
         *      )
         *  )
         * ```
         */
        expect( () => pgreaterInt.$( pInt( 2 ) ) ).not.toThrow();

    })
})