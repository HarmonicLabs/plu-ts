import { TermType, int, asData } from "../../types"
import { termTypeToString } from "../../utils"
import { clearAsData } from "../clearAsData"
import { unwrapAsData } from "../unwrapAsData"

describe("clearAsData", () => {

    function testType( t: TermType, expected: TermType ): void
    {
        test( termTypeToString( t ), () => {

            expect( clearAsData( t ) ).toEqual( expected );
            expect( clearAsData( t )[0] ).toEqual( unwrapAsData( t )[0] );

        })
    }

    testType( asData( int ), int );
})