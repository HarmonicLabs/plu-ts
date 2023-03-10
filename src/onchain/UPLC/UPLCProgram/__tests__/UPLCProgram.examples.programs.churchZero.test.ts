/* COMMANDS USED (from the plutus directory)
cabal run uplc -- example -s churchZero >> uplcExamples/churchZero.uplc # then remove manually "Up to date"
cabal run uplc -- convert -i uplcExamples/churchZero.uplc --if textual -o uplcExamples/churchZero.flat --of flat
xxd -b uplcExamples/churchZero.flat
*/
/*
cabal run uplc -- example -s churchZero

(program 1.0.0 (delay (lam z (lam f z))))
*/

import Debug from "../../../../utils/Debug";
import { UPLCProgram } from "..";
import { BinaryString } from "../../../../types/bits/BinaryString";
import { BitStream } from "../../../../types/bits/BitStream";
import { UPLCEncoder } from "../../UPLCEncoder";
import { Delay } from "../../UPLCTerms/Delay";
import { Lambda } from "../../UPLCTerms/Lambda";
import { UPLCVar } from "../../UPLCTerms/UPLCVar";


describe.skip("churchZero", () => {

    it("serializes as in the example", () => {

        const plutsCompiled = UPLCEncoder.compile(
            new UPLCProgram(
                [ 1, 0, 0 ],
                new Delay(
                    new Lambda(
                        new Lambda(
                            new UPLCVar( 2 )
                        )
                    )
                )
            )
        );

        const manuallyCompiled = BitStream.fromBinStr(
            new BinaryString(
                [
                    "00000001" + "00000000" + "00000000", // version 1.0.0
                    "0001", // Delay
                        "0010", // Lambda
                            "0010", // Lambda
                                "0000", // UPLCVar
                                    "0" + "0000010", // nil constructor + unsigned 2 binary ( deBruijn )
                    "00000001"
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