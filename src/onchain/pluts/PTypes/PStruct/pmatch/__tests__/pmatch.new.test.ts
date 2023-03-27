import { int } from "../../../../type_system";
import { pstruct } from "../../pstruct";
import { Machine, Term, pDataI, pInt, padd, pmatch } from "../../../../..";
import { compileIRToUPLC } from "../../../../../IR/toUPLC/compileIRToUPLC";
import { prettyUPLC, showUPLC } from "../../../../../UPLC/UPLCTerm";
import { prettyIRJsonStr } from "../../../../../IR/utils/showIR";


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
        .onTwoNums( nums =>  padd.$( nums.a ).$( nums.b ) )
        .onThreeNums( nums => 
            padd.$( nums.c ).$(
                padd.$( nums.d ).$( nums.e )
            )
        );

        const ir = term.toIR();

        const uplc = compileIRToUPLC( ir );

        expect(Machine.evalSimple(
            uplc
        )).toEqual(Machine.evalSimple(
            pInt( 5 )
        ));
        
    });
    
    test("can use dot notation with methods", () => {

        const term =  pmatch( Nums.TwoNums({ a: pDataI(2), b: pDataI(3) }) )
        .onTwoNums( nums =>  nums.a.add( nums.b ) )
        .onThreeNums( nums => nums.c.add( nums.d ).add( nums.e ) );

        const ir = term.toIR();

        const uplc = compileIRToUPLC( ir );

        expect(Machine.evalSimple(
            uplc
        )).toEqual(Machine.evalSimple(
            pInt( 5 )
        ));
        
    });

    test("strange edge case", () => {

        const term =  pmatch( Nums.TwoNums({ a: pDataI(2), b: pDataI(3) }) )
        .onTwoNums( nums => {

            if( nums instanceof Term )
            {
                console.error( Error().stack );
            }
            
            return padd.$( nums.a ).$(
                padd.$( nums.a ).$( nums.b )
            );
        })
        .onThreeNums( nums => 
            padd.$( nums.c ).$(
                padd.$( nums.d ).$( nums.e )
            )
        );

        const ir = term.toIR();

        // console.log( prettyIRJsonStr( ir ) )

        // console.log( showIR( ir ) );
        const uplc = compileIRToUPLC( ir );
        const uplcStr =  showUPLC( uplc );

        expect(
            uplcStr
        ).toEqual(
            "[(lam a [[[(lam b (lam c (lam d [(lam e [[(lam f (force [[[(force (builtin ifThenElse)) [f (con integer 0)]] (delay d)] (delay (force [[[(force (builtin ifThenElse)) [f (con integer 1)]] (delay c)] (delay (error))]))])) [(builtin equalsInteger) [(force (force (builtin fstPair))) e]]] [(force (force (builtin sndPair))) e]]) [(builtin unConstrData) b]]))) (con data #d879820203)] (lam b [[(builtin addInteger) [(builtin unIData) [(force (builtin headList)) b]]] [[(builtin addInteger) [(builtin unIData) [a b]]] [(builtin unIData) [(lam c [(force (builtin headList)) [(force (builtin tailList)) [(force (builtin tailList)) c]]]) b]]]])] (lam b [(lam c [[(builtin addInteger) c] [[(builtin addInteger) c] [(builtin unIData) [a b]]]]) [(builtin unIData) [(force (builtin headList)) b]]])]) (lam a [(force (builtin headList)) [(force (builtin tailList)) a]])]"
        )

        expect(Machine.evalSimple(
            uplc
        )).toEqual(Machine.evalSimple(
            pInt( 7 )
        ));
        
    });

    

});