import { parseFile } from "../parseFile";

describe("parseFile", () => {

    function testParse( src: string, log: boolean = false )
    {
        test(src, () => {
            let result: any;
            expect(() => result = parseFile( "test.pebble", src )).not.toThrow();
            log && console.log( result );
        });
    }

    describe("simple var decls", () => {
        testParse( "const a = 1;" );
        testParse( "let a = 1;" );
        testParse( "var a = 1;" );
    });

    describe("type keyword", () => {
        testParse( "type Integer = number;" );
        testParse( "type Integer implements MyInterface {};" );
    });

    describe("mutable assignment", () => {
        testParse( "var a = 1; a = 2;" );
        testParse( "var a = 1; a |= 2;" );
    })
});