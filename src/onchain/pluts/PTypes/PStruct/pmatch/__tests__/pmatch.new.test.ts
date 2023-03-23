import { pmatch } from "../new_improved";
import { int } from "../../../../type_system";
import { pstruct } from "../../pstruct";
import { Machine, pDataI, pInt, padd } from "../../../../..";
import { showIR } from "../../../../../IR/utils/showIR";
import { compileIRToUPLC } from "../../../../../IR/toUPLC/compileIRToUPLC";
import { showUPLC } from "../../../../../UPLC/UPLCTerm";


const Nums = pstruct({
    TwoNums: {
        a: int,
        b: int
    },
    ThreeNums: {
        c: int,
        d: int,
        e: int
    }
});

describe("pmatch", () => {

    test("can use dot notation", () => {

        const term =  pmatch( Nums.TwoNums({ a: pDataI(2), b: pDataI(3) }) )
        .onTwoNums( nums => {

            console.log( nums );
            
            return padd.$( nums.a ).$(
                padd.$( nums.a ).$( nums.b )
            )
        })
        .onThreeNums( nums => 
            padd.$( nums.c ).$(
                padd.$( nums.d ).$( nums.e )
            )
        );

        const ir = term.toIR();

        console.log( showIR( ir ) );
        const uplc = compileIRToUPLC( ir );
        console.log( showUPLC( uplc ) );
        

        expect(Machine.evalSimple(
            uplc
        )).toEqual(Machine.evalSimple(
            pInt( 5 )
        ));
        
    });

});