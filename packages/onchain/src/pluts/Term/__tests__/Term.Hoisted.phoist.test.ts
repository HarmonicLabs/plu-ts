import { pgreaterInt } from "../../lib/builtins/int/intBinOpToBool"
import { pInt } from "../../lib/std/int/pInt"


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