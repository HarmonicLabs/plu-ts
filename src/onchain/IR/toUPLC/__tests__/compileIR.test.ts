import { showUPLC } from "../../../UPLC/UPLCTerm";
import { Application } from "../../../UPLC/UPLCTerms/Application";
import { Lambda } from "../../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../../UPLC/UPLCTerms/UPLCVar";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRNative } from "../../IRNodes/IRNative";
import { IRVar } from "../../IRNodes/IRVar";
import { compileIRToUPLC } from "../compileIRToUPLC";


describe("compileIRToUPLC", () => {

    test("IRVar", () => {

        const ir = new IRVar( 0 );
        const _irUPlC = ir.toUPLC();

        expect(
            _irUPlC
        ).toEqual(
            new UPLCVar( 0 )
        )
    })

    test("simple",() => {

        const idIR = new IRFunc( 1, new IRVar(0) );

        const idUPLC = idIR.toUPLC();

        const expected = new Lambda( new UPLCVar( 0 ) );

        expect(
            idUPLC
        ).toEqual(
            expected
        );

    });

    test("z_comb", () => {

        const z = IRNative.z_comb;

        const ir_zUPLC = compileIRToUPLC( z );

        const innerZ = new Lambda( // toMakeRecursive
            new Application(
                new UPLCVar( 1 ), // Z
                new Lambda( // value
                    new Application(
                        new Application(
                            new UPLCVar( 1 ), // toMakeRecursive
                            new UPLCVar( 1 )  // toMakeRecursive
                        ),
                        new UPLCVar( 0 ) // value
                    )
                )
            )
        );

        const ZUPLC = new Application(
            new Lambda( new UPLCVar( 0 ) ),
            new Lambda( // Z
                new Application(
                    innerZ,
                    innerZ.clone()
                )
            )
        );

        // console.log( showUPLC( ir_zUPLC ) )
        // console.log( showUPLC( ZUPLC ) )

        expect(
            ir_zUPLC
        ).toEqual(
            ZUPLC
        )

    })

});