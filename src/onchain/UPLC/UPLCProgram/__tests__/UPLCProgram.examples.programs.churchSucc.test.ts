/* COMMANDS USED (from the plutus directory)
cabal run uplc -- example -s churchSucc >> uplcExamples/churchSucc.uplc # then remove manually "Up to date"
cabal run uplc -- convert -i uplcExamples/churchSucc.uplc --if textual -o uplcExamples/churchSucc.flat --of flat
xxd -b uplcExamples/churchSucc.flat
*/
/*
cabal run uplc -- example -s churchSucc

(program 1.0.0 (lam n (delay (lam z (lam f [ f [ [ (force n) z ] f ] ])))))
*/

import Debug from "../../../../utils/Debug";
import { UPLCProgram } from "..";
import { BinaryString } from "../../../../types/bits/BinaryString";
import { BitStream } from "../../../../types/bits/BitStream";
import { UPLCEncoder } from "../../UPLCEncoder";
import { Application } from "../../UPLCTerms/Application";
import { Delay } from "../../UPLCTerms/Delay";
import { Force } from "../../UPLCTerms/Force";
import { Lambda } from "../../UPLCTerms/Lambda";
import { UPLCVar } from "../../UPLCTerms/UPLCVar";


describe.skip("churchSucc", () => {

    it("serializes as in the example", () => {

        const plutsCompiled = UPLCEncoder.compile(
            new UPLCProgram(
                [ 1, 0, 0 ],
                new Lambda( // n
                    new Delay(
                        new Lambda( // z
                            new Lambda( // f
                                new Application(
                                    new UPLCVar( 1 ), // f
                                    new Application(
                                        new Application(
                                            new Force(
                                                new UPLCVar( 3 ) // n
                                            ),
                                            new UPLCVar( 2 ) // z
                                        ),
                                        new UPLCVar( 1 ) // f
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );

        const manuallyCompiled = BitStream.fromBinStr(
            new BinaryString(
                [
                    "00000001" + "00000000" + "00000000", // version 1.0.0
                    "0010", // Lambda
                        "0001", // Delay
                            "0010", // Lambda
                                "0010", // Lambda
                                    "0011", // Application
                                        "0000", // UPLCVar
                                            "0" + "0000001", // nil constructor + unsinged 1 binary
                                        "0011", // Application
                                            "0011", // Application
                                                "0101", // Force
                                                    "0000", // UPLCVar
                                                        "0" + "0000011", // nil constructor + unsinged 3 binary 
                                                "0000", // UPLCVar
                                                    "0" + "0000010", // nil constructor + unsinged 2 binary
                                                "0000", // UPLCVar
                                                    "0" + "0000001", // nil constructor + unsinged 1 binary
                    "00000001" // padding
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