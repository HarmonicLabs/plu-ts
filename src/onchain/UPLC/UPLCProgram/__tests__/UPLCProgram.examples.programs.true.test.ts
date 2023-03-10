/* COMMANDS USED (from the plutus directory)
cabal run uplc -- example -s true >> uplcExamples/true.uplc # then remove manually "Up to date"
cabal run uplc -- convert -i uplcExamples/true.uplc --if textual -o uplcExamples/true.flat --of flat
xxd -b uplcExamples/true.flat
*/
/*
cabal run uplc -- example -s true

(program 1.0.0 (con bool True))
*/

import Debug from "../../../../utils/Debug";
import { UPLCProgram } from "..";
import { BinaryString } from "../../../../types/bits/BinaryString";
import { BitStream } from "../../../../types/bits/BitStream";
import { UPLCEncoder } from "../../UPLCEncoder";
import { UPLCConst } from "../../UPLCTerms/UPLCConst";


describe("true", () => {

    it("serializes as in the example", () => {

        const plutsCompiled = UPLCEncoder.compile(
            new UPLCProgram(
                [ 1, 0, 0 ],
                UPLCConst.bool( true )
            )
        );

        const manuallyCompiled = BitStream.fromBinStr(
            new BinaryString(
                [
                    "00000001" + "00000000" + "00000000", // version 1.0.0
                    "0100", // const tag
                        "1" + "0100" + "0", // bool type
                        "1", // True
                    "00001" // padding
                ].join('')
            )
        );

        Debug.log(
            '',"compilation result:\n\t" + 
            plutsCompiled.toBinStr().asString, "\n",
            "specification expected:\n\t" +
            manuallyCompiled.toBinStr().asString
        );

        expect(
            plutsCompiled.toBinStr().asString
        ).toBe(
            manuallyCompiled.toBinStr().asString
        )

        expect(
            BitStream.eq(
                plutsCompiled,
                manuallyCompiled
            )
        ).toBe( true )

    });

})