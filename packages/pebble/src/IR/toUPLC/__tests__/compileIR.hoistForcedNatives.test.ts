import { IRApp, IRConst, IRFunc, IRNative, IRVar } from "../../IRNodes";
import { _ir_apps } from "../../tree_utils/_ir_apps";
import { hoistForcedNatives } from "../subRoutines/hoistForcedNatives";

describe("hoistForcedNatives", () => {

    test("hoist single use", () => {
        const term = _ir_apps(
            IRNative.strictIfThenElse,
            IRConst.bool( true ),
            IRConst.int( 1 ),
            IRConst.int( 2 )
        );
        const finalTerm = new IRApp(
            new IRFunc( 1,
                _ir_apps(
                    new IRVar( 0 ),
                    IRConst.bool( true ),
                    IRConst.int( 1 ),
                    IRConst.int( 2 )
                )
            ),
            IRNative.strictIfThenElse
        );
        expect( hoistForcedNatives( term ).toJson() ).toEqual( finalTerm.toJson() );
    });

    test("hoist multiple use; dbn 0", () => {
        const term = _ir_apps(
            IRNative.strictIfThenElse,
            IRConst.bool( true ),
            IRConst.int( 1 ),
            IRConst.int( 2 )
        );
        const parent = _ir_apps(
            IRNative.strictIfThenElse,
            IRConst.bool( true ),
            term.clone(),
            term.clone()
        );
        const finalTerm = _ir_apps(
            new IRVar( 0 ),
            IRConst.bool( true ),
            IRConst.int( 1 ),
            IRConst.int( 2 )
        );
        const finalParent = new IRApp(
            new IRFunc( 1,
                _ir_apps(
                    new IRVar( 0 ),
                    IRConst.bool( true ),
                    finalTerm.clone(),
                    finalTerm.clone()
                )
            ),
            IRNative.strictIfThenElse
        );
        expect( hoistForcedNatives( parent ).toJson() ).toEqual( finalParent.toJson() );
    });

    test("hoist multiple use; dbn 1", () => {
        const term = new IRFunc( 1,
            _ir_apps(
                IRNative.strictIfThenElse,
                IRConst.bool( true ),
                new IRVar( 0 ),
                IRConst.int( 2 )
            )
        );
        const parent = _ir_apps(
            IRNative.strictIfThenElse,
            IRConst.bool( true ),
            term.clone(),
            term.clone()
        );
        const finalTerm = new IRFunc( 1,
            _ir_apps(
                new IRVar( 1 ),
                IRConst.bool( true ),
                new IRVar( 0 ),
                IRConst.int( 2 )
            )
        );
        const finalParent = new IRApp(
            new IRFunc( 1,
                _ir_apps(
                    new IRVar( 0 ),
                    IRConst.bool( true ),
                    finalTerm.clone(),
                    finalTerm.clone()
                )
            ),
            IRNative.strictIfThenElse
        );
        expect( hoistForcedNatives( parent ).toJson() ).toEqual( finalParent.toJson() );
    });

});