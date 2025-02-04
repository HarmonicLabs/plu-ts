import { IRHoisted, getHoistedTerms } from "../../../../../IR/IRNodes/IRHoisted";
import { compileIRToUPLC } from "../../../../../IR/toUPLC/compileIRToUPLC";
import { showIR } from "../../../../../IR/utils/showIR";
import { int } from "../../../../../type_system";
import { pfind } from "../pfind"

describe("pfind.toIR", () => {

    test("pfind( int )", () => {

        const term = pfind( int );
        const ir: IRHoisted = term.toIR() as any;

        expect( ir instanceof IRHoisted ).toBe( true );

        expect(
            () => compileIRToUPLC( ir )
        ).not.toThrow()

    })
})