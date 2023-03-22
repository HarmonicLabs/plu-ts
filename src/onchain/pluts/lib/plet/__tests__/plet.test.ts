import { pfn, plet } from "../.."
import { showIR } from "../../../../IR/utils/showIR";
import { compile } from "../../../Script";
import { int } from "../../../type_system"


const double = pfn([ int ], int)
( n => n.add( n ) )

describe("plet", () => {

    test("add factorials", () => {

        const quadruple = pfn([ int ], int )
        ( n => {

            const doubled = plet( double.$( n ) );

            return doubled.add( doubled ); 
            return plet( double.$( n ) ).in( doubled =>
                
                doubled.add( doubled )

            )

        });

        const ir = quadruple.toIR();
        console.log( showIR( ir ) );
        const uplc = ir.toUPLC();
    });

})