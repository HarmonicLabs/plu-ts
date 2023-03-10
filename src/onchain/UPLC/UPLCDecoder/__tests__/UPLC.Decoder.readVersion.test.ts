import { UPLCDecoder } from ".."
import { UPLCEncoder } from "../../UPLCEncoder"
import { UPLCProgram } from "../../UPLCProgram"
import { UPLCVersion } from "../../UPLCProgram/UPLCVersion"
import { UPLCConst } from "../../UPLCTerms/UPLCConst"

describe("readVersion", () => {

    test("1.2.3", () => {
        
        expect(
            UPLCDecoder.parse(
                UPLCEncoder.compile(
                    new UPLCProgram(
                        new UPLCVersion( 1, 2, 3 ),
                        UPLCConst.int(11)
                    )
                ).toBuffer().buffer,
                "flat"
            ).version
        ).toEqual( new UPLCVersion( 1, 2, 3 ) );
        
    })

    test("128.2.3 (2 bytes)", () => {
        
        const v = UPLCDecoder.parse(
            UPLCEncoder.compile(
                new UPLCProgram(
                    new UPLCVersion( 128, 2, 3 ),
                    UPLCConst.int(11)
                )
            ).toBuffer().buffer,
            "flat"
        ).version;

        expect(
            v
        ).toEqual( new UPLCVersion( 128, 2, 3 ) );
        
    })

})