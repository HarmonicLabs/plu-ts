import { parseFile } from "../parseFile";

describe("parseFile", () => {

    let src = "const a = 1";
    test(src, () => {
        console.log( parseFile( "test.pebble", src ) )
    });
})