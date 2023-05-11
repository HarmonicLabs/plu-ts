import { showUPLC } from "../../../UPLC/UPLCTerm";
import { Application } from "../../../UPLC/UPLCTerms/Application";
import { Lambda } from "../../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../../UPLC/UPLCTerms/UPLCVar";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRNative } from "../../IRNodes/IRNative";
import { IRVar } from "../../IRNodes/IRVar";
import { _irToUplc } from "../_internal/_irToUplc";
import { compileIRToUPLC } from "../compileIRToUPLC";


describe("compileIRToUPLC", () => {

    test("IRVar", () => {

        const ir = new IRVar( 0 );
        const _irUPlC = _irToUplc( ir );

        expect(
            _irUPlC
        ).toEqual(
            new UPLCVar( 0 )
        )
    })

    test("simple",() => {

        const idIR = new IRFunc( 1, new IRVar(0) );

        const idUPLC = _irToUplc( idIR );

        const expected = new Lambda( new UPLCVar( 0 ) );

        expect(
            idUPLC
        ).toEqual(
            expected
        );

    });

});