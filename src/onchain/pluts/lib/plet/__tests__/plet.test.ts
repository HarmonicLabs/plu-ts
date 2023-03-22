import { pfn, plet } from "../.."
import { compileIRToUPLC } from "../../../../IR/toUPLC/compileIRToUPLC";
import { showUPLC } from "../../../../UPLC/UPLCTerm";
import { int } from "../../../type_system"


const double = pfn([ int ], int)
( n => n.add( n ) )

describe("plet", () => {

    test("add factorials", () => {

        const quadruple = pfn([ int ], int )
        ( n => {

            const doubled = plet( double.$( n ) );

            return doubled.add( doubled );
        });

        const oldQuadruple = pfn([ int ], int )
        ( n => {
            return plet( double.$( n ) ).in( doubled =>
                
                doubled.add( doubled )

            )
        })

        const ir = quadruple.toIR();
        const uplc = compileIRToUPLC( ir );

        const oldIR = oldQuadruple.toIR();
        const oldUPLC = compileIRToUPLC( oldIR )

        console.log( showUPLC( uplc ) );

        expect( uplc ).toEqual( oldUPLC )
    });

})