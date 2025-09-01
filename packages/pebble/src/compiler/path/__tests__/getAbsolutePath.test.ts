import { getAbsolutePath } from "../getAbsolutePath";

describe("getAbsolutePath", () => {

    function testPath( relative: string, absolute: string, expected: string | undefined ) {
        test(`${relative} from ${absolute} should return ${expected}`, () => {
            const result = getAbsolutePath( relative, absolute );
            expect( result ).toEqual( expected );
        });
    }

    testPath("./c", "/a/b.pebble", "/a/c.pebble");
    testPath("../c", "/a/b.pebble", "/c.pebble");
    testPath("../../c", "/a/b.pebble", undefined);

    testPath("././c", "/a/b.pebble", "/a/c.pebble");

    describe("from root", () => {
        testPath("./c", "/", "/c.pebble");
        testPath("../c", "/", undefined);
        testPath("/a/b.pebble", "/", "/a/b.pebble");

        describe("single dot", () => {
            //*
            testPath("./a/./b/./c", "/", "/a/b/c.pebble");
            testPath("./a/b/././c", "/", "/a/b/c.pebble");
            testPath("./a/b/c/.", "/", "/a/b/c.pebble");
            testPath("./././a/b/c", "/", "/a/b/c.pebble");
            testPath("./a/././b/././c", "/", "/a/b/c.pebble");
            //*/
            
            // final `./` tells us that `c` is a directory
            testPath("./a/b/c/./", "/", "/a/b/c/index.pebble");
            testPath("./a/./b/./c/./", "/", "/a/b/c/index.pebble");
            
            testPath("./a/../b/c", "/", "/b/c.pebble");
            /*
        
            testPath("../../a/b/c", "../../a/b/c");
            testPath(".././../a/b/c", "../../a/b/c");
            testPath("../../a/./b/c", "../../a/b/c");
    
    
            //*/
        })
    });
});