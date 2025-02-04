import { Machine } from "@harmoniclabs/plutus-machine";
import { showUPLC } from "@harmoniclabs/uplc";
import { pDataI, pInt, padd, pfn, plet, pstruct } from "../../..";
import { IRLetted, IRNative, IRVar, IRFunc, IRConst } from "../../../../IR/IRNodes";
import { compileIRToUPLC } from "../../../../IR/toUPLC/compileIRToUPLC";
import { _ir_apps } from "../../../../IR/tree_utils/_ir_apps";
import { pmatch } from "../../pmatch";
import { int } from "../../../../type_system/types";

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

        const term = pmatch( Nums.TwoNums({ a: pDataI(2), b: pDataI(3) }) )
        .onTwoNums( nums => {

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

        // expect(
        //     uplcStr
        // ).toEqual(
        //     "[(lam a [[[(lam b (lam c (lam d [(lam e [[(lam f (force [[[(force (builtin ifThenElse)) [f (con integer 0)]] (delay d)] (delay (force [[[(force (builtin ifThenElse)) [f (con integer 1)]] (delay c)] (delay (error))]))])) [(builtin equalsInteger) [(force (force (builtin fstPair))) e]]] [(force (force (builtin sndPair))) e]]) [(builtin unConstrData) b]]))) (con data #d879820203)] (lam b [[(builtin addInteger) [(builtin unIData) [(force (builtin headList)) b]]] [[(builtin addInteger) [(builtin unIData) [a b]]] [(builtin unIData) [(lam c [(force (builtin headList)) [(force (builtin tailList)) [(force (builtin tailList)) c]]]) b]]]])] (lam b [(lam c [(lam d [[(builtin addInteger) d] [[(builtin addInteger) d] c]]) [(builtin unIData) [(force (builtin headList)) b]]]) [(builtin unIData) [a b]]])]) (lam a [(force (builtin headList)) [(force (builtin tailList)) a]])]"
        // )

        expect(Machine.evalSimple(
            uplc
        )).toEqual(Machine.evalSimple(
            pInt( 7 )
        ));
        
    });

    describe("two multi-refs", () => {

        test("no deps", () => {

            const added = new IRLetted( 2,
                _ir_apps(
                    IRNative.addInteger,
                    new IRVar( 0 ),
                    new IRVar( 1 )
                )
            );

            const multiplied = new IRLetted( 2,
                _ir_apps(
                    IRNative.multiplyInteger,
                    new IRVar( 0 ),
                    new IRVar( 1 ),
                )
            );

            const ir = new IRFunc( 2,
                _ir_apps(
                    IRNative.multiplyInteger,
                    _ir_apps(
                        IRNative.addInteger,
                        added.clone(),
                        multiplied.clone()
                    ),
                    _ir_apps(
                        IRNative.multiplyInteger,
                        added.clone(),
                        multiplied.clone()
                    ),
                )
            );

            // compiles
            expect( () => compileIRToUPLC( ir.clone()) ).not.toThrow();

            const x = 7;
            const y = 13;

            const _added = x + y;
            const _multiplied = x * y;

            const applied = _ir_apps(
                ir,
                IRConst.int( x ),
                IRConst.int( y ),
            );

            expect(
                Machine.evalSimple(
                    compileIRToUPLC( applied )
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt(
                        ( _added + _multiplied ) * ( _added * _multiplied )
                    )
                )
            )

        });

        test("shared dep", () => {

            const term = pfn([ int, int ], int )
            (( x, y ) => {

                const shared = plet( x.add( x ) )
                const a = plet( shared.add( y ) );
                const b = plet( shared.mult( y ) );

                return a.add( b )
            });

            // compiles
            expect( () => term.toUPLC() ).not.toThrow();

            // console.log( prettyIRJsonStr( term.toIR() ) )

        });

        test("replaced with replaced dep (single var)", () => {

            const term = pfn([ int ], int )
            (( x ) => {

                const dep = plet( x.add( x ) )
                const a = plet( dep.add( dep ) );

                return a.add( a )
            });

            // compiles
            expect( () => term.toUPLC() ).not.toThrow();

        });

        test("replaced with replaced dep (two vars)", () => {

            const term = pfn([ int, int ], int )
            // this y needs to be here; that's the point of the test
            (( x, y ) => {

                const dep = plet( x.add( x ) )
                const a = plet( dep.add( dep ) );

                return a.add( a )
            });

            // compiles
            expect( () => term.toUPLC() ).not.toThrow();

        });

    })
    

});