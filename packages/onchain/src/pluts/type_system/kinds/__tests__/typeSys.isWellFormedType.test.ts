import { TermType, bs, fn, int, lam } from "../../types"
import { isWellFormedType, isWellFormedGenericType } from "../../kinds";
import { termTypeToString } from "../../utils";


describe("isWellFormedGenericType", () => {

    function yes( t: TermType )
    {
        test( termTypeToString( t ), () => {
            expect(
                isWellFormedType( t )
            ).toBe( true );
            // every well formed term type is also a well formed generic term type
            expect(
                isWellFormedGenericType( t )
            ).toBe( true );
        })
    }

    yes( lam( bs, int ) );
    yes( fn([ bs, int ], int) );
})