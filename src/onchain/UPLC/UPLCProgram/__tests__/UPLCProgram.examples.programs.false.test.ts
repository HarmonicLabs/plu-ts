/* COMMANDS USED (from the plutus directory)
cabal run uplc -- example -s false >> uplcExamples/false.uplc # then remove manually "Up to date"
cabal run uplc -- convert -i uplcExamples/false.uplc --if textual -o uplcExamples/false.flat --of flat
xxd -b uplcExamples/false.flat
*/
/*
cabal run uplc -- example -s false

(program 1.0.0 (con bool False))
*/

import UPLCProgram from "..";
import BinaryString from "../../../../types/bits/BinaryString";
import BitStream from "../../../../types/bits/BitStream";
import Debug from "../../../../utils/Debug";
import UPLCEncoder from "../../UPLCEncoder";
import Const from "../../UPLCTerms/Const";


describe("false", () => {

    it("serializes as in the example", () => {

        const plutsCompiled = UPLCEncoder.compile(
            new UPLCProgram(
                [ 1, 0, 0 ],
                Const.bool( false )
            )
        );

        const manuallyCompiled = BitStream.fromBinStr(
            new BinaryString(
                [
                    "00000001" + "00000000" + "00000000", // version 1.0.0
                    "0100", // const tag
                        "1" + "0100" + "0", // bool type
                        "0", // False
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