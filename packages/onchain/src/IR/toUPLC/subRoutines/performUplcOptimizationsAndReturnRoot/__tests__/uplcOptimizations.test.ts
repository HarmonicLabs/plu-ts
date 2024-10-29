import { showUPLC } from "@harmoniclabs/uplc";
import { IRApp, IRCase, IRConst, IRConstr, IRFunc, IRNative, IRVar } from "../../../../IRNodes";
import { _ir_apps } from "../../../../tree_utils/_ir_apps";
import { performUplcOptimizationsAndReturnRoot } from "..";
import { productionOptions } from "../../../CompilerOptions";
import { _irToUplc } from "../../../_internal/_irToUplc";
import { getExpandedIRFunc } from "../expandFuncsAndReturnRoot";
import { Machine } from "@harmoniclabs/plutus-machine";

describe("uplc optimizations", () => {

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

    test.skip("letted", () => {

        const inner = _ir_apps(
            IRNative.subtractInteger,
            _ir_apps(
                IRNative.addInteger,
                new IRVar( 2 ),
                new IRVar( 1 ),
            ),
            new IRVar( 0 )
        )

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

        console.log( a );

        expect( a ).toEqual( showUPLC( bUplc ) );
    })
});