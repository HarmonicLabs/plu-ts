import { TermType, alias, bool, bs, fn, int, lam } from "../../types"
import { isWellFormedType, isWellFormedGenericType } from "../../kinds";
import { termTypeToString } from "../../utils";
import { pBool } from "../../../pluts/lib/std/bool/pBool";
import { pfn } from "../../../pluts/lib/pfn";

const fakeTerm = pfn([ int ], bool )(( n ) => pBool( true ));

describe("isWellFormedType", () => {

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
    
    yes( alias( int ) );
    yes( alias( int, {} ) );
    yes( alias( int, { foo: fakeTerm } ) );

})