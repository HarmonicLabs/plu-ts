import * as uint8array from "@harmoniclabs/uint8array-utils";
import { seahash_ref } from "../seahash/reference";
import { seahash } from "../seahash";

describe("seahash_ref", () => {

    describe("reference", () => {
        
        test.skip("shakespear", () => {
    
            const expected = new Uint8Array(8);
            uint8array.writeBigUInt64BE( expected, BigInt("1988685042348123509"), 0 );
    
            const input = uint8array.fromAscii(
                "to be or not to be"
            );
    
            const received = seahash( input );
    
            console.log("received:", uint8array.toHex( received ) );
            console.log("expected:", uint8array.toHex( expected ) );
    
            expect(
                received
            ).toEqual(
                expected
            );
    
        })

    })

})