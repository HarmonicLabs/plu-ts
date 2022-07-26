import UPLCProgram from ".."
import BinaryString from "../../../../../types/bits/BinaryString"
import BitStream from "../../../../../types/bits/BitStream"
import Debug from "../../../../../utils/Debug"
import Const from "../../UPLCTerms/Const"

describe("con11 UPLCProgram", () => {

    it("serializes as in specification", () => {
        
        // https://hydra.iohk.io/build/5988492/download/1/plutus-core-specification.pdf#Example
        const plutsCompiled = new UPLCProgram(
                [ 11, 22, 33 ],
                Const.int( 11 )
            ).toUPLCBitStream();

        const manuallyCompiled = BitStream.fromBinStr(
            new BinaryString(
                [
                    "0" + "0001011",    // last list elem + 11.toString(2)
                    "0" + "0010110",    // last list elem + 22.toString(2)
                    "0" + "0100001",    // last list elem + 33.toString(2)
                    "0100",             // term tag: constant
                                        // constant type tags encoded as list of tags
                    "1" + "0000" + "0", // list cons + tag 0 for integer type + list nil
                                        // integer as list of 7 bits
                    "0" + "0010110",    // nil constructor + zigzag(11).toString(2)
                    "000001"            // padding
                ].join('')
            )
        );

        const { nInitialZeroes: plutsInit0s, bigint: plutsBI } = plutsCompiled.asBigInt();
        const { nInitialZeroes: manualInit0s, bigint: manualBI } = manuallyCompiled.asBigInt();

        Debug.log(
            '',"compilation result:\n\t" + 
            "0".repeat( plutsInit0s ) + plutsBI.toString(2), "\n",
            "specification expected:\n\t" +
            "0".repeat( manualInit0s ) + manualBI.toString(2)
        );

        expect(
            "0".repeat( plutsInit0s ) + plutsBI.toString(2)
        ).toBe(
            "0".repeat( manualInit0s ) + manualBI.toString(2)
        )

        expect(
            BitStream.eq(
                plutsCompiled,
                manuallyCompiled
            )
        ).toBe( true )
    })
})