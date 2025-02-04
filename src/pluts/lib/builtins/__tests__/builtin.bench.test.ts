import { Machine } from "@harmoniclabs/plutus-machine"
import { pif, pstrictIf } from "../bool"
import { int } from "../../../../type_system"
import { pBool, pInt, perror, pmatch, psop } from "../../.."
import { defaultV3Costs } from "@harmoniclabs/cardano-costmodels-ts";
import { UPLCDecoder, UPLCEncoder, UPLCProgram, showUPLC } from "@harmoniclabs/uplc";

const SopBool = psop({
    True: {},
    False: {}
});

describe("builtin bench", () => {

    test("ifThenElse", () => {

        const machine = new Machine( defaultV3Costs );

        const _ifTerm = (
            pif( int ).$( pBool( true ) )
            .$( 1 )
            .$( 2 )
        );
        const ifTerm = UPLCDecoder.parse(
            UPLCEncoder.compile(
                new UPLCProgram(
                    [ 1, 1, 0 ],
                    _ifTerm.toUPLC( 0 ),
                )
            ).toBuffer().buffer
        ).body;
        const a = machine.eval( ifTerm );

        const sopIfTerm = (
            pmatch( SopBool.True({}) )
            .onTrue( _ => pInt( 1 ) )
            .onFalse( _ => pInt( 2 ) )
        ) 
        const b = machine.eval( sopIfTerm );

        // console.log( showUPLC( ifTerm ) );
        // console.log( showUPLC( sopIfTerm.toUPLC() ) );

        // console.log(
        //     a.budgetSpent.toJson(),
        //     b.budgetSpent.toJson(),
        // );
    })

})