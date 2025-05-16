import { isIdentifier } from "../../utils/text";
import { getUniqueInternalName, isInternalName } from "../internalVar";

test("isInternalVar", () => {

    function testStr( str: string, expected: boolean = true )
    {
        expect( isIdentifier( str ) ).toBe( expected );
        expect( isInternalName( str ) ).toBe( !expected );
        expect( isInternalName( getUniqueInternalName( str ) ) ).toBe( expected );
    }

    testStr( "a" );
});