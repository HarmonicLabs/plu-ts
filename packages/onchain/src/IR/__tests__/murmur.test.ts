import { murmurHash } from "../murmur";

describe("murmur", () => {

    const tests: number[] = new Array( 128 )
    .fill( 0 )
    .map(( _, i ) => murmurHash( new Uint8Array( i ) ));

    test("unique 0s", () => {

        expect(
            [ ...new Set( tests ) ].length
        ).toBe( tests.length );
        
    });

});