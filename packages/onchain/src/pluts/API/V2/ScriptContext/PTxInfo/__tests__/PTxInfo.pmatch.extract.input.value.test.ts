import { Machine } from "@harmoniclabs/plutus-machine";
import { PValue } from "../../../../V1/Value/PValue";
import { pBool, punMapData, toData } from "../../../../../lib";

describe("input value extraction", () => {

    test("extract tx_v2.inputs", () => {

        expect(
            () => tx_v2.extract("inputs").in( ({ inputs }) => inputs ).toUPLC(0)
        ).not.toThrow()

    })

    test("extracts input value", () => {

        const uplc = tx_v2.extract("inputs").in( ({ inputs }) => 
            inputs.head.extract("resolved").in( ({ resolved: input }) => 
            input.extract("value").in( ({ value }) => value
        ))).toUPLC(0);

        // console.log( showUPLC( uplc ) )

        const res = Machine.evalSimple(
            uplc
        );

        // console.log( res );

        const expected = Machine.evalSimple(
            punMapData.$( toData( PValue.type )( beef32 ) )
        );

        // console.log( expected )
        
        expect(
            res
        ).toEqual(
            expected
        );

    });

    test("extracts signatories", () => {

        const term = tx_v2.extract("signatories").in( ({ signatories: sigs }) => sigs.head.eq("deadbeef") );
        const uplc = term.toUPLC(0);
        const res = Machine.evalSimple(
            uplc
        );

        expect(
            res
        ).toEqual(
            Machine.evalSimple(
                pBool( true )
            )
        )
    })
    
})