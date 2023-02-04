/* COMMANDS USED (from the plutus directory)
cabal run uplc -- example -s overapplication >> uplcExamples/overapplication.uplc # then remove manually "Up to date"
cabal run uplc -- convert -i uplcExamples/overapplication.uplc --if textual -o uplcExamples/overapplication.flat --of flat
xxd -b uplcExamples/overapplication.flat
*/
/*
cabal run uplc -- example -s overapplication

(program
  1.0.0
  [
    [
      [
        [
          [
            (force (builtin ifThenElse))
            [ [ (builtin lessThanInteger) (con integer 0) ] (con integer 3) ]
          ]
          (builtin addInteger)
        ]
        (builtin subtractInteger)
      ]
      (con integer 0)
    ]
    (con integer 3)
  ]
)
*/

import Debug from "../../../../utils/Debug";
import { UPLCProgram } from "..";
import { BinaryString } from "../../../../types/bits/BinaryString";
import { BitStream } from "../../../../types/bits/BitStream";
import { UPLCEncoder } from "../../UPLCEncoder";
import { Application } from "../../UPLCTerms/Application";
import { Builtin } from "../../UPLCTerms/Builtin";
import { UPLCConst } from "../../UPLCTerms/UPLCConst";


describe("overapplication", () => {

    it("serializes as in the example", () => {

        const plutsCompiled = UPLCEncoder.compile( 
            new UPLCProgram(
                [ 1, 0, 0 ],
                new Application(
                    new Application(
                        new Application(
                            new Application(
                                new Application(
                                    // takes care of the force too
                                    Builtin.ifThenElse,
                                    new Application(
                                        new Application(
                                            Builtin.lessThanInteger,
                                            UPLCConst.int( 0 )
                                        ),
                                        UPLCConst.int( 3 )
                                    )
                                ),
                                Builtin.addInteger
                            ),
                            Builtin.subtractInteger
                        ),
                        UPLCConst.int( 0 )
                    ),
                    UPLCConst.int( 3 )
                )
            )
        );

        const manuallyCompiled = BitStream.fromBinStr(
            new BinaryString(
                [
                    "00000001" + "00000000" + "00000000", // version 1.0.0
                    "0011", // Application
                        "0011", // Application
                            "0011", // Application
                                "0011", // Application
                                    "0011", // Application
                                        "0101" + "0111" + "0011010", // force + builtin + 26 binary (ifThenElse tag)
                                        "0011", // Application
                                            "0011", // Application
                                                "0111" + "0001000", // builtin + 8 binary (lessThanInteger tag)
                                                "0100", // const
                                                    "1" + "0000"+ "0", // const int type
                                                    "0" + "0000000", // zigzag( 0 ) binary
                                            "0100", // const
                                                "1" + "0000" + "0", // const int type
                                                "0" + "0000110", // zigzag( 3 ) bianry
                                        "0111" + "0000000", // builtin + addInteger tag
                                    "0111" + "0000001", // builtin + subtractInteger tag
                                "0100", // const
                                    "1" + "0000" + "0", // integer type
                                    "0" + "0000000", // zigzag( 0 ) binary
                            "0100", // const 
                                "1" + "0000" + "0", // int
                                "00000110", // zig zag ( 3 )
                    "0001"
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