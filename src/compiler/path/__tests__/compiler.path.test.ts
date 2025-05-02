/*
import { removeSingleDotDirsFromPath, dirname, resolveProjAbsolutePath, getAbsolutePath } from "../path";

describe("path", () => {

    describe("getAbsolutePath", () => {

        function testPath( inp: string, req: string, out: string | undefined )
        {
            test(inp + " -> " + out, () => {
                expect( getAbsolutePath( inp, req ) ).toEqual( out );
            })
        }

        testPath("./../", "/", undefined)

    });

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
 
    describe.only("resolveProjAbsolutePath", () => {

        function testPath( inp: string, origin: string, out: string | undefined )
        {
            test(inp + " from " + origin +" -> " + out, () => {
                const result = resolveProjAbsolutePath( inp, origin )
                expect( result ).toEqual( out );
            });
        }

        // testPath("../c","/b", undefined);
        // testPath("./c","/a/b","/a/c");
        testPath("./c/","/a/b","/a/c/index");

        // testPath("../../c/d/e","/a/b/f","/a/c/d/e");
        // testPath("../../c/d/e/","/a/b/f","/a/c/d/e/");
        // testPath("..","/a/b/f","/a/b/");
        // testPath("../../../","/a/b/c","/");
        // testPath("../../..","/a/b/c","/");
        // testPath("../../../../","/a/b/c", undefined );
    })
})

//*/