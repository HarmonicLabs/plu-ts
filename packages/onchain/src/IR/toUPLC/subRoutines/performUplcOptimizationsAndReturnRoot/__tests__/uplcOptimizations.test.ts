import { showUPLC } from "@harmoniclabs/uplc";
import { IRApp, IRCase, IRConst, IRConstr, IRFunc, IRNative, IRVar } from "../../../../IRNodes";
import { _ir_apps } from "../../../../tree_utils/_ir_apps";
import { _ir_let } from "../../../../tree_utils/_ir_let";
import { performUplcOptimizationsAndReturnRoot } from "..";
import { productionOptions } from "../../../CompilerOptions";
import { _irToUplc } from "../../../_internal/_irToUplc";
import { getExpandedIRFunc } from "../expandFuncsAndReturnRoot";
import { Machine } from "@harmoniclabs/plutus-machine";

const prodNoMarker = { ...productionOptions, addMarker: false };

describe.skip("uplc optimizations", () => {

    test("ifThenElse", () => {

        const original = _ir_apps(
            IRNative.strictIfThenElse,
            IRConst.bool(true),
            IRConst.int( 1 ),
            IRConst.int( 0 )
        );

        const expected = new IRCase(
            new IRConstr( 0, [
                IRConst.bool(true),
                IRConst.int(1),
                IRConst.int(0)
            ]),
            [ IRNative.strictIfThenElse ]
        );

        const a = showUPLC( _irToUplc( performUplcOptimizationsAndReturnRoot( original, productionOptions ) ).term );
        const b = showUPLC( _irToUplc( expected ).term );

        // console.log( a );

        expect( a ).toEqual( b );
    });

    test("multi app",() => {
        
        const original = _ir_apps(
            new IRFunc( 3,
                _ir_apps(
                    IRNative.subtractInteger,
                    new IRVar( 0 ),
                    _ir_apps(
                        IRNative.addInteger,
                        new IRVar( 1 ),
                        new IRVar( 2 )
                    )
                )
            ),
            IRConst.int( 1 ),
            IRConst.int( 2 ),
            IRConst.int( 3 )
        );

        const expected = new IRCase(
            new IRConstr( 0, [
                IRConst.int( 1 ),
                IRConst.int( 2 ),
                IRConst.int( 3 ),
            ]),
            [
                getExpandedIRFunc(
                    _ir_apps(
                        IRNative.subtractInteger,
                        new IRVar( 0 ),
                        _ir_apps(
                            IRNative.addInteger,
                            new IRVar( 1 ),
                            new IRVar( 2 )
                        )
                    ),
                    3
                )
            ]
        );
        
        const aUplc = _irToUplc( performUplcOptimizationsAndReturnRoot( original, productionOptions ) ).term;

        const a = showUPLC( aUplc );
        const b = showUPLC( _irToUplc( expected ).term );

        console.log( a );

        const originalUplc = _irToUplc( original ).term;

        const aRes = Machine.eval( aUplc );
        const originalRes = Machine.eval( originalUplc );

        expect( a ).toEqual( b );

        console.log( aRes.result, originalRes.result );
        console.log( aRes.budgetSpent.toJSON(), originalRes.budgetSpent.toJSON() );
    });

    test("letted", () => {

        const inner = _ir_apps(
            IRNative.subtractInteger,
            _ir_apps(
                IRNative.addInteger,
                new IRVar( 2 ),
                new IRVar( 1 ),
            ),
            new IRVar( 0 )
        );

        const original = new IRApp(
            new IRFunc( 1,
                new IRApp(
                    new IRFunc( 1,
                        new IRApp(
                            new IRFunc( 1,
                                inner.clone()
                            ),
                            IRConst.int( 3 )
                        )
                    ),
                    IRConst.int( 2 )
                )
            ),
            IRConst.int( 1 )
        );

        const expected = new IRCase(
            new IRConstr( 0, [ IRConst.int(1), IRConst.int(2), IRConst.int(3) ] ),
            [
                getExpandedIRFunc(
                    inner.clone(),
                    3
                )
            ]
        );

        const aUplc = _irToUplc( performUplcOptimizationsAndReturnRoot( original, productionOptions ) ).term;
        const bUplc = _irToUplc( expected ).term;

        const a = showUPLC( aUplc );

        // console.log( a );

        expect( a ).toEqual( showUPLC( bUplc ) );
    });

    describe.skip("mixed", () => {

        const inner = IRConst.int( 42 );

        test("let => multi app", () => {

            const original = _ir_let(
                IRConst.int( 1 ),
                _ir_let(
                    IRConst.int( 2 ),
                    _ir_let(
                        IRConst.int( 3 ),
                        _ir_apps(
                            getExpandedIRFunc( inner, 3 ),
                            new IRVar( 0 ), // 3
                            new IRVar( 1 ), // 2
                            new IRVar( 2 )  // 1
                        )
                    )
                )
            );
    
            // console.log( showUPLC( _irToUplc( original ).term ) );
            expect( showUPLC( _irToUplc( performUplcOptimizationsAndReturnRoot( original, prodNoMarker ) ).term ) )
            .toEqual(
                "(case (constr 0 (con integer 1) (con integer 2) (con integer 3)) (lam a (lam b (lam c (case (constr 0 c b a) (lam d (lam e (lam f (con integer 42)))))))))"
            );
        });

        test("multi app => let", () => {

            const original = _ir_apps(
                getExpandedIRFunc(
                    _ir_let(
                        new IRVar( 2 ),
                        _ir_let(
                            new IRVar( 2 ),
                            _ir_let(
                                new IRVar( 2 ),
                                inner
                            )
                        )
                    )
                , 3 ),
                IRConst.int( 3 ),
                IRConst.int( 2 ),
                IRConst.int( 1 )
            );

            // console.log( showUPLC( _irToUplc( performUplcOptimizationsAndReturnRoot( original, prodNoMarker ) ).term ) )

        });

    });
});