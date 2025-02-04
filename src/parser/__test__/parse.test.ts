import { parseFile } from "../parseFile";

describe("parseFile", () => {

    function parseAndLog( src: string )
    {
        test(src, () => {
            console.log( parseFile( "test.pebble", src ) )
        });
    }

    parseAndLog( "const a = 1;" );
    parseAndLog( "let a = 1;" );
    parseAndLog( "var a = 1;" );
    // parseAndLog( "var a = 1; a = 2;" );

    parseAndLog( "type Integer = number;" );
    parseAndLog( "type Integer implements MyInterface {};" );
});