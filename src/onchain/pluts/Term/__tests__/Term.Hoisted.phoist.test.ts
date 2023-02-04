import { Term } from ".."
import { UPLCVar } from "../../../UPLC/UPLCTerms/UPLCVar"
import { pgreaterInt } from "../../stdlib/Builtins"
import { pInt } from "../../PTypes/PInt"
import { phoist } from "../../Syntax/syntax"
import {Type} from "../Type/base"


describe("phoist", () => {

    it.skip("throws on non closed terms", () => {

        expect( () => phoist(
            new Term(
                Type.Int,
                _dbn => new UPLCVar( -1 )
            )
        )).toThrow()

    })

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