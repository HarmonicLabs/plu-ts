import { isIdentifier } from "../../utils/text";
import { getInternalVarName, isInternalName } from "../internalVar";

test("isInternalVar", () => {

    function testStr( str: string, expected: boolean = true )
    {
        expect( isIdentifier( str ) ).toBe( expected );
        expect( isInternalName( str ) ).toBe( !expected );
        expect( isInternalName( getInternalVarName( str ) ) ).toBe( expected );
    }

    testStr( "a" );
});