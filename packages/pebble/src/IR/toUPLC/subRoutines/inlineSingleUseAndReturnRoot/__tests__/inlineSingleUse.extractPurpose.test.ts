
/*
input: 

(lam a
    [
        (lam b 
            [
                (lam c 
                    [
                        c 
                        [
                            c 
                            b
                        ]
                    ]
                ) 
                (force (builtin tailList))
            ]
        ) 
        [
            (force (force (builtin sndPair))) 
            [
                (builtin unConstrData) 
                a
            ]
        ]
    ]
)
*/

import { IRFunc, IRNative, IRVar } from "../../../../IRNodes"
import { _ir_apps } from "../../../../tree_utils/_ir_apps";
import { prettyIR } from "../../../../utils";
import { inlineSingleUseAndReturnRoot } from "../inlineSingleUseAndReturnRoot";

/*
expected output:

(lam a
    [
        (lam c 
            [
                c 
                [
                    c 
                    [
                        (force (force (builtin sndPair))) 
                        [
                            (builtin unConstrData) 
                            a
                        ]
                    ]
                ]
            ]
        ) 
        (force (builtin tailList))
    ]
)
*/

test("extract purpose", () => {

    const input = new IRFunc( 1, // a
        _ir_apps(
            new IRFunc( 1, // b
                _ir_apps(
                    new IRFunc( 1, // c
                        _ir_apps(
                            new IRVar( 0 ), // c
                            _ir_apps(
                                new IRVar( 0 ), // c
                                new IRVar( 1 ) // b
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

    const output = new IRFunc( 1, // a
        _ir_apps(
            new IRFunc( 1, // c
                _ir_apps(
                    new IRVar( 0 ), // c
                    _ir_apps(
                        new IRVar( 0 ), // c
                        _ir_apps(
                            IRNative.sndPair,
                            _ir_apps(
                                IRNative.unConstrData,
                                new IRVar( 1 ) // a
                            )
                        )
                    )
                )
            ),
            IRNative.tailList,
        )
    );

    const { term: result } = inlineSingleUseAndReturnRoot( input.clone() );

    expect( prettyIR( result ).text )
    .toEqual( prettyIR( output ).text );

    // console.log( prettyIR( result, 2 ).text );
})