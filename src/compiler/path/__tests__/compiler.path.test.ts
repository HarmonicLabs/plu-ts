import { removeSingleDotDirsFromPath, dirname, resolveProjAbsolutePath } from "../path";

describe("path", () => {

    describe("removeSingleDotDirsFromPath", () => {
        
        function testPath( inp: string, out: string )
        {
            test(inp + " -> " + out, () => {
                expect( removeSingleDotDirsFromPath( inp ) ).toEqual( out );
            })
        }

        testPath("./a/b/c"          , "a/b/c");
        testPath("././a/b/c"        , "a/b/c");
        testPath("a/b/c"            , "a/b/c");
        testPath("./a/./b/./c"      , "a/b/c");
        testPath("./a/b/././c"      , "a/b/c");
        testPath("./a/b/c/."        , "a/b/c");
        testPath("./././a/b/c"      , "a/b/c");
        testPath("./a/././b/././c"  , "a/b/c");

        // final `./` tells us that `c` is a directory
        testPath("./a/b/c/./"       , "a/b/c/");
        testPath("./a/./b/./c/./"   , "a/b/c/");
        
        testPath("../../a/b/c", "../../a/b/c");
        testPath(".././../a/b/c", "../../a/b/c");
        testPath("../../a/./b/c", "../../a/b/c");

        testPath("../../a/../b/c", "../../b/c");

    });

    describe("dirname", () => {
        
        function testPath( inp: string, out: string )
        {
            test(inp + " -> " + out, () => {
                expect( dirname( inp ) ).toEqual( out );
            })
        }

        testPath("./a/b/c"          , "a/b/");
        testPath("././a/b/c"        , "a/b/");
        testPath("a/b/c"            , "a/b/");
        testPath("./a/./b/./c"      , "a/b/");
        testPath("./a/b/././c"      , "a/b/");
        testPath("./a/b/c/."        , "a/b/");
        testPath("./././a/b/c"      , "a/b/");
        testPath("./a/././b/././c"  , "a/b/");

        // final `./` tells us that `c` is a directory
        testPath("./a/b/c/./"       , "a/b/c/");
        testPath("./a/./b/./c/./"   , "a/b/c/");
        
        testPath("../../a/b/c", "../../a/b/");
        testPath("../../a/b/c/", "../../a/b/c/");
        testPath(".././../a/b/c", "../../a/b/");
        testPath("../../a/./b/c", "../../a/b/");

    });
 
    describe("resolveProjAbsolutePath", () => {

        function testPath( inp: string, origin: string, out: string | undefined )
        {
            test(inp + " from " + origin +" -> " + out, () => {
                expect( resolveProjAbsolutePath( inp, origin ) ).toEqual( out );
            });
        }

        testPath("../c","b","c");
        testPath("../c","a/b","a/c");
        testPath("../c/","a/b","a/c/");
        testPath("../../c/d/e","a/b/f","a/c/d/e");
        testPath("../../c/d/e/","a/b/f","a/c/d/e/");
        testPath("..","a/b/f","a/b/");

        testPath("../../../","a/b/c","./");
        testPath("../../..","a/b/c","./");

        testPath("../../../../","a/b/c", undefined );
    })
})