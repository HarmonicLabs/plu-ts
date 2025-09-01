import { parseFile } from "../parseFile";

describe("parse hex bytes", () => {

    function testParse( src: string, log: boolean = false )
    {
        test(src, () => {
            let result: any;
            expect(() => result = parseFile( "test.pebble", src )).not.toThrow();
            log && console.log( result );
        });
    }

    describe("simple var decls", () => {
        testParse( "const a = #;" );
        testParse( "const a = #f;" );
        testParse( "const a = #ff;" );
    });
});