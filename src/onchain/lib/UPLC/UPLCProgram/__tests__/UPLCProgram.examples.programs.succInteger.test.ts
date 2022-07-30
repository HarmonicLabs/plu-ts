/* COMMANDS USED (from the plutus directory)
cabal run uplc -- example -s succInteger >> uplcExamples/succInteger.uplc # then remove manually "Up to date"
cabal run uplc -- convert -i uplcExamples/succInteger.uplc --if textual -o uplcExamples/succInteger.flat --of flat
xxd -b uplcExamples/succInteger.flat
*/
/*
cabal run uplc -- example -s succInteger

(program 1.0.0 (lam i [ [ (builtin addInteger) i ] (con integer 1) ]))
*/

import UPLCProgram from "..";
import BinaryString from "../../../../../types/bits/BinaryString";
import BitStream from "../../../../../types/bits/BitStream";
import ByteString from "../../../../../types/HexString/ByteString";
import Debug from "../../../../../utils/Debug";
import Application from "../../UPLCTerms/Application";
import Builtin from "../../UPLCTerms/Builtin";
import Const from "../../UPLCTerms/Const";
import Lambda from "../../UPLCTerms/Lambda";
import UPLCVar from "../../UPLCTerms/UPLCVar";


describe("succInteger", () => {

    it("serializes as in the example", () => {

        const plutsCompiled = new UPLCProgram(
            [ 1, 0, 0 ],
            new Lambda(
                new Application(
                    new Application(
                        Builtin.addInteger,
                        new UPLCVar( 1 )
                    ),
                    Const.int( 1 )
                )
            )
        ).toUPLCBitStream();

        const manuallyCompiled = BitStream.fromBinStr(
            new BinaryString(
                [
                    "00000001" + "00000000" + "00000000", // version 1.0.0
                    
                    "0010", // Lambda
                        "0011", // Application
                            "0011", // Application
                                "0111", // Builtin
                                    "0000000", // addInteger
                                "0000", // Var tag
                                    "0" + "0000001", // nil constructor + unsinged 1 ( deBruijn )
                                "0100", // Const tag
                                    "1" + "0000" + "0", // const type int
                                    "0" + "0000010", // zigzag(1) ( === 2 ) binary
                    "001" // padding
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