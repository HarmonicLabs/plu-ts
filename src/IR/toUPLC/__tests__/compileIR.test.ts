import { UPLCVar, Lambda } from "@harmoniclabs/uplc";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRVar } from "../../IRNodes/IRVar";
import { _irToUplc } from "../_internal/_irToUplc";


describe("compileIRToUPLC", () => {

    test("IRVar", () => {

        const ir = new IRVar( 0 );
        const _irUPlC = _irToUplc( ir ).term;

        expect(
            _irUPlC
        ).toEqual(
            new UPLCVar( 0 )
        )
    })

    test("simple",() => {

        const idIR = new IRFunc( 1, new IRVar(0) );

        const idUPLC = _irToUplc( idIR ).term;

        const expected = new Lambda( new UPLCVar( 0 ) );

        expect(
            idUPLC
        ).toEqual(
            expected
        );

    });

});