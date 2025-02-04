import { pBool, pfn, plet } from "../.."
import { compileIRToUPLC } from "../../../../IR/toUPLC/compileIRToUPLC";
import { bool, int } from "../../../../type_system"


const double = pfn([ int ], int)
( n => n.add( n ) )

describe("plet", () => {

    test("quadruple", () => {

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

        expect( uplc ).toEqual( oldUPLC )
    });

    test("let in and", () => {

        const fancyIsZero = pfn([ int ], bool )
        ( n => pBool( true )
            .and(
                plet( n.add( 4 ) ).in( expected4 => expected4.eq( 4 ) )
            )
        );

        const ir = fancyIsZero.toIR();
        const uplc = compileIRToUPLC( ir );

        // console.log( showUPLC( uplc ) );

    });

})