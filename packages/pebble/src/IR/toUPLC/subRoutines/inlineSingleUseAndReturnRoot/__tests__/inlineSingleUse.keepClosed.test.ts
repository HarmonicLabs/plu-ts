import { IRFunc, IRNative, IRVar } from "../../../../IRNodes";
import { _ir_apps } from "../../../../tree_utils/_ir_apps";
import { prettyIR } from "../../../../utils";
import { inlineSingleUseAndReturnRoot } from "../inlineSingleUseAndReturnRoot";

// Utility to assert the term is closed (no unbound De Bruijn indices)
function assertClosed(term: any): void {
    function walk(t: any, depth: number): void {
        if(t instanceof IRVar) {
            if(t.dbn < 0 || t.dbn >= depth) {
                throw new Error(`unbound variable with dbn ${t.dbn} at depth ${depth}`);
            }
            return;
        }
        const nextDepth = t instanceof IRFunc ? depth + t.arity : depth;
        for(const c of t.children()) walk(c, nextDepth);
    }
    walk(term, 0);
}

test("single-use inlining preserves closedness", () => {
    // Same structure used in extract purpose test; known to trigger single-use inlining.
    // (lam a
    //     [ (lam b [ (lam c [ c [ c b ] ]) (force (builtin tailList)) ])
    //       [ (force (force (builtin sndPair))) [ (builtin unConstrData) a ] ] ] )

    const input = new IRFunc( 1, // a (not applied, nothing to inline)
        _ir_apps(
            new IRFunc( 1, // b (to be inlined)
                _ir_apps(
                    new IRFunc( 1, // c
                        _ir_apps(
                            new IRVar( 0 ), // c
                            _ir_apps(
                                new IRVar( 0 ), // c
                                new IRVar( 1 ) // b (to be inlined)
                            )
                        )
                    ),
                    IRNative.tailList,
                )
            ),
            _ir_apps(
                IRNative.sndPair,
                _ir_apps(
                    IRNative.unConstrData,
                    new IRVar( 0 ) // a
                )
            )
        )
    );

    // Pre-condition: input must be closed
    assertClosed( input );

    const { term: inlined, somethingWasInlined } = inlineSingleUseAndReturnRoot( input.clone() );

    expect( somethingWasInlined ).toBe( true );

    // Should remain closed after inlining
    expect( () => assertClosed( inlined ) ).not.toThrow();

    // (Optional) sanity: pretty print to aid debugging if failure
    // console.log( prettyIR( inlined ).text );
});

test("multi single-use simultaneous inlining preserves closedness", () => {
    // Construct a function with two parameters each used exactly once inside a deeper lambda.
    // Both arguments reference an outer variable so dbn shifting must be correct for both.
    // Structure (pseudo IR):
    // lam a (
    //   (lam b c
    //      (lam d
    //         d (d c)  -- d applied to (d c); c used once, b used once via separate path
    //      )
    //      b
    //      c
    //   )  argB  argC
    // )
    // where argB = a, argC = a so after inlining both b and c their occurrences must still point to outer a.

    const outer = new IRFunc( 1, // a
        _ir_apps(
            new IRFunc( 2, // b c
                _ir_apps(
                    new IRFunc( 1, // d
                        _ir_apps(
                            new IRVar( 0 ), // d
                            _ir_apps(
                                new IRVar( 0 ), // d
                                new IRVar( 2 ) // c (dbn 2: d=0, c=1, b=2) used once
                            )
                        )
                    ),
                    new IRVar( 0 ), // b used once
                    new IRVar( 1 )  // c used once (also referenced inside inner lam through dbn 2)
                )
            ),
            new IRVar( 0 ), // arg for b -> a
            new IRVar( 0 )  // arg for c -> a
        )
    );

    // Pre-condition
    assertClosed( outer );

    const { term: inlined, somethingWasInlined } = inlineSingleUseAndReturnRoot( outer.clone() );

    expect( somethingWasInlined ).toBe( true );
    expect( () => assertClosed( inlined ) ).not.toThrow();

    // console.log( prettyIR( inlined ).text );
});
