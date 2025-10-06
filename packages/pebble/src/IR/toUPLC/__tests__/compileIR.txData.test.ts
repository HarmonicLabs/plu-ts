import { IRApp, IRCase, IRConst, IRConstr, IRDelayed, IRError, IRForced, IRFunc, IRHoisted, IRLetted, IRNative, IRTerm, IRVar, onlyHoistedAndLetted, prettyIR } from "../..";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { IRSelfCall } from "../../IRNodes/IRSelfCall";
import { mapArrayLike } from "../../IRNodes/utils/mapArrayLike";
import { _ir_apps } from "../../tree_utils/_ir_apps";
import { _ir_lazyIfThenElse } from "../../tree_utils/_ir_lazyIfThenElse";
import { _ir_let } from "../../tree_utils/_ir_let";
import { hoisted_drop2 } from "../subRoutines/_comptimeDropN";
import { handleLettedAndReturnRoot } from "../subRoutines/handleLetted";
import { replaceForcedNativesWithHoisted } from "../subRoutines/replaceForcedNativesWithHoisted";
import { replaceHoistedWithLetted } from "../subRoutines/replaceHoistedWithLetted";
import { hoisted_length } from "../subRoutines/replaceNatives/nativeToIR";

function letClosed( term: IRTerm ): IRLetted
{
    const letted = new IRLetted(
        0xffffffff,
        term,
        { isClosed: true }
    );
    letted.hash; // precompute
    return letted;
}

const letted_head = letClosed( IRNative.headList );
const letted_ifThenElse = letClosed( IRNative.strictIfThenElse );
const letted_tail = letClosed( IRNative.tailList );
const letted_add1 = letClosed( _ir_apps( IRNative.addInteger, IRConst.int( 1 ) ) ); 
const letted_chooseList = letClosed( IRNative.strictChooseList );
const letted_fst = letClosed( IRNative.fstPair );
const letted_snd = letClosed( IRNative.sndPair );
const letted_drop2 = letClosed( hoisted_drop2.hoisted.clone() );
const letted_length = letClosed( hoisted_length.hoisted.clone() );

const letted_ctxPair = (
    new IRLetted(
        5,
        _ir_apps(
            IRNative.unConstrData,
            new IRVar( 4 )
        )
    )
);

const letted_ctxFields = (
    new IRLetted(
        5,
        _ir_apps(
            letted_snd.clone(),
            letted_ctxPair.clone()
        )
    )
);

const letted_txData = (
    new IRLetted(
        5,
        _ir_apps(
            letted_head.clone(),
            letted_ctxFields.clone()
        )
    )
);

const letted_purpData = (
    new IRLetted(
        1,
        _ir_apps(
            letted_head.clone(),
            _ir_apps(
                letted_drop2.clone(),
                cloneIncremented( letted_ctxFields, -4 )
            )
        )
    )
);

function cloneIncremented( term: IRTerm, incr: number ): IRTerm
{
    if( term instanceof IRVar ) return new IRVar( term.dbn + incr );
    if( term instanceof IRSelfCall ) return new IRVar( term.dbn + incr );
    if( term instanceof IRFunc ) {
        const body = cloneIncremented( term.body, incr );
        return new IRFunc( term.arity, body );
    }
    if( term instanceof IRRecursive ) {
        const body = cloneIncremented( term.body, incr );
        return new IRRecursive( body );
    }
    if( term instanceof IRApp ) {
        const fn = cloneIncremented( term.fn, incr );
        const arg = cloneIncremented( term.arg, incr );
        return new IRApp( fn, arg );
    }
    if( term instanceof IRDelayed ) {
        const body = cloneIncremented( term.delayed, incr );
        return new IRDelayed( body );
    }
    if( term instanceof IRForced ) {
        const body = cloneIncremented( term.forced, incr );
        return new IRForced( body );
    }
    if( term instanceof IRLetted ) {
        const value = cloneIncremented( term.value, incr );
        return new IRLetted( term.dbn + incr, value, { isClosed: term.meta.isClosed } );
    }
    if( term instanceof IRHoisted ) {
        const hoisted = cloneIncremented( term.hoisted, incr );
        return new IRHoisted( hoisted );
    }
    if( term instanceof IRConstr ) {
        return new IRConstr( term.index, mapArrayLike( term.fields, f => cloneIncremented( f, incr ) ) );
    }
    if( term instanceof IRCase ) {
        return new IRCase(
            cloneIncremented( term.constrTerm, incr ),
            mapArrayLike( term.continuations, cont => cloneIncremented( cont, incr ) ),
        );
    }
    if( term instanceof IRConst ) return term.clone();
    if( term instanceof IRNative ) return term.clone();
    if( term instanceof IRError ) return term.clone();
    const tsEnsureExhaustive: never = term;
    throw new Error("Not exhaustive");
}


describe("txData", () => {

    test.skip("original spendsSomething", () => {
        
        // IR as in the final comment of this file
        const input = (
            new IRFunc(1, // 0: ctxData
                new IRForced(
                    _ir_let(// 0: purpPair, 1: ctxData
                        _ir_apps( IRNative.unConstrData, letted_purpData.clone() ),
                        _ir_let(// 0: isPurpIdx, 1: purpPair, 2: ctxData
                            _ir_apps( IRNative.equalsInteger, _ir_apps( letted_fst.clone(), new IRVar(0) ) ),
                            _ir_apps(
                                IRNative.strictIfThenElse,
                                _ir_apps(
                                    new IRVar(0), // isPurpIdx
                                    IRConst.int(1),
                                ),
                                // then
                                new IRDelayed(
                                    _ir_let( // 0: purpFields, 1: isPurpIdx, 2: purpPair, 3: ctxData
                                        _ir_apps( letted_snd.clone(), new IRVar(1) ), // purpPair
                                        _ir_apps(
                                            new IRFunc( 2, // 0: e, 1: f, 2: purpFields, 3: isPurpIdx, 4: purpPair, 5: ctxData
                                                _ir_lazyIfThenElse(
                                                    // condition
                                                    _ir_apps(
                                                        IRNative.lessThanInteger,
                                                        IRConst.int(0),
                                                        _ir_apps(
                                                            letted_length.clone(),
                                                            new IRForced(
                                                                _ir_let( // 0: txPair, 1: isTxIdx, 2: purpFields, 3: isPurpIdx, 4: purpPair, 5: ctxData
                                                                    _ir_apps( IRNative.unConstrData, letted_txData.clone() ),
                                                                    _ir_let( // 0: isTxIdx, 1: txPair, 2: purpFields, 3: isPurpIdx, 4: purpPair, 5: ctxData
                                                                        _ir_apps(
                                                                            IRNative.equalsInteger,
                                                                            _ir_apps( letted_fst.clone(), new IRVar(0) ) // txPair
                                                                        ),
                                                                        _ir_apps(
                                                                            IRNative.strictIfThenElse,
                                                                            _ir_apps(
                                                                                new IRVar(0), // isTxIdx
                                                                                IRConst.int(0)
                                                                            ),
                                                                            // then
                                                                            new IRDelayed(
                                                                                _ir_apps(
                                                                                    IRNative.unListData,
                                                                                    _ir_apps(
                                                                                        letted_head.clone(),
                                                                                        _ir_apps(
                                                                                            letted_snd.clone(),
                                                                                            new IRVar(1) // txPair
                                                                                        )
                                                                                    )
                                                                                )
                                                                            ),
                                                                            // else
                                                                            new IRDelayed( new IRError() )
                                                                        )
                                                                    )
                                                                )
                                                            )
                                                        )
                                                    ),
                                                    // then
                                                    IRConst.unit.clone(),
                                                    // else
                                                    new IRError()
                                                )
                                            ),
                                            _ir_apps(
                                                letted_head.clone(),
                                                new IRVar(0) // purpFields
                                            ),
                                            _ir_apps(
                                                letted_head.clone(),
                                                _ir_apps(
                                                    letted_tail.clone(),
                                                    new IRVar(0) // purpFields
                                                )
                                            )
                                        )
                                    )
                                ),
                                // else
                                new IRDelayed( new IRError() )
                            )
                        )
                    )
                )
            )
        );

        const output = minimalCompileIR( input );
        
    });

    test.only("only purpData and txData", () => {

        // original letted_txData was used at dbn 5, now at used at dbn 2
        // subract 3 from all dbns
        const this_letted_txData = cloneIncremented( letted_txData, 2 - 5 );
        
        // remove everything not related to getting txData and purpData
        const input = (
            new IRFunc(1, // 0: ctxData
                new IRForced(
                    _ir_let(// 0: purpPair, 1: ctxData
                        _ir_apps( IRNative.unConstrData, letted_purpData.clone() ),
                        _ir_let(// 0: isPurpIdx, 1: purpPair, 2: ctxData
                            _ir_apps( IRNative.equalsInteger, _ir_apps( letted_fst.clone(), new IRVar(0) ) ),
                            _ir_apps(
                                IRNative.strictIfThenElse,
                                _ir_apps(
                                    new IRVar(0), // isPurpIdx
                                    IRConst.int(1),
                                ),
                                // then
                                new IRDelayed(
                                    _ir_let( // 0: txPair, 1: isPurpIdx, 2: purpPair, 3: ctxData
                                        _ir_apps( IRNative.unConstrData, this_letted_txData.clone() ),
                                        new IRVar(0)
                                    )
                                ),
                                // else
                                new IRDelayed( new IRError() )
                            )
                        )
                    )
                )
            )
        );

        const output = minimalCompileIR( input );

        const outIr = prettyIR( output, 2 ).text;

    const wrongIr_1 = (
`
(func  a 
  [
    (func  b 
      [
        (func  c 
          (force 
            [
              (func  d 
                [
                  (func  e 
                    [
                      [
                        [
                          (native ifThenElse) 
                          [
                            e 
                            (const int 1)
                          ]
                        ] 
                        (delay 
                          [
                            (func  f 
                              f
                            ) 
                            [
                              (native unConstrData) 
                              [
                                b 
                                [
                                  c 
                                  [
                                    (native unConstrData) 
                                    d
                                  ]
                                ]
                              ]
                            ]
                          ]
                        )
                      ] 
                      (delay (error)
                      )
                    ]
                  ) 
                  [
                    (native equalsInteger) 
                    [
                      (native fstPair) 
                      d
                    ]
                  ]
                ]
              ) 
              [
                (native unConstrData) 
                [
                  b 
                  [
                    (func  d 
                      [
                        (func  e 
                          [
                            e 
                            [
                              e 
                              d
                            ]
                          ]
                        ) 
                        (native tailList)
                      ]
                    ) 
                    [
                      c 
                      [
                        (native unConstrData) 
                        a
                      ]
                    ]
                  ]
                ]
              ]
            ]
          )
        ) 
        (native sndPair)
      ]
    ) 
    (native headList)
  ]
)`);

        // same as 1, but snd and head swapped
        const wrongIr_2 = (
`
(func  a 
  [
    (func  b 
      [
        (func  c 
          (force 
            [
              (func  d 
                [
                  (func  e 
                    [
                      [
                        [
                          (native ifThenElse) 
                          [
                            e 
                            (const int 1)
                          ]
                        ] 
                        (delay 
                          [
                            (func  f 
                              f
                            ) 
                            [
                              (native unConstrData) 
                              [
                                c 
                                [
                                  b 
                                  [
                                    (native unConstrData) 
                                    d
                                  ]
                                ]
                              ]
                            ]
                          ]
                        )
                      ] 
                      (delay (error)
                      )
                    ]
                  ) 
                  [
                    (native equalsInteger) 
                    [
                      (native fstPair) 
                      d
                    ]
                  ]
                ]
              ) 
              [
                (native unConstrData) 
                [
                  c 
                  [
                    (func  d 
                      [
                        (func  e 
                          [
                            e 
                            [
                              e 
                              d
                            ]
                          ]
                        ) 
                        (native tailList)
                      ]
                    ) 
                    [
                      b 
                      [
                        (native unConstrData) 
                        a
                      ]
                    ]
                  ]
                ]
              ]
            ]
          )
        ) 
        (native headList)
      ]
    ) 
    (native sndPair)
  ]
)`
        );

        expect( outIr ).not.toEqual( wrongIr_1 )
        expect( outIr ).not.toEqual( wrongIr_2 );
        
    });
});

function minimalCompileIR( term: IRTerm ): IRTerm
{
    replaceForcedNativesWithHoisted( term );
    replaceHoistedWithLetted( term );

    let irJson = prettyIR( term );
    console.log(
        "input IR:",
        irJson.text,
        JSON.stringify( onlyHoistedAndLetted( irJson ), null, 2 ),
    );

    term = handleLettedAndReturnRoot( term );

    irJson = prettyIR( term );
    console.log(
        "output IR:",
        irJson.text,
        JSON.stringify( onlyHoistedAndLetted( irJson ), null, 2 ),
    );
    return term;
}

/*
// original
(func {§SpendsSomething_6b} ctxData 
  (force 
    [
      (func  purpPair 
        [
          (func  isPurpIdx
            [
              [
                [
                  (letted 4294967295 ifThenElse) 
                  [
                    isPurpIdx 
                    (const int 1)
                  ]
                ] 
                (delay 
                  [
                    (func  purpFields 
                      [
                        [
                          (func  e f 
                            (force 
                              [
                                [
                                  [
                                    (letted 4294967295 ifThenElse) 
                                    [
                                      [
                                        (native lessThanInteger) 
                                        (const int 0)
                                      ] 
                                      [
                                        (letted 4294967295 length) 
                                        (force 
                                          [
                                            (func  txPair 
                                              [
                                                (func  isTxIdx 
                                                  [
                                                    [
                                                      [
                                                        (letted 4294967295 ifThenElse) 
                                                        [
                                                          isTxIdx 
                                                          (const int 0)
                                                        ]
                                                      ] 
                                                      (delay 
                                                        [
                                                          (native unListData) 
                                                          [
                                                            (letted 4294967295 head) 
                                                            [
                                                              (letted 4294967295 snd) 
                                                              txPair
                                                            ]
                                                          ]
                                                        ]
                                                      )
                                                    ] 
                                                    (delay (error)
                                                    )
                                                  ]
                                                ) 
                                                [
                                                  (native equalsInteger) 
                                                  [
                                                    (letted 4294967295 fst) 
                                                    txPair
                                                  ]
                                                ]
                                              ]
                                            ) 
                                            [
                                              (native unConstrData) 
                                              (letted 5 txData)
                                            ]
                                          ]
                                        )
                                      ]
                                    ]
                                  ] 
                                  (delay 
                                    (const void ())
                                  )
                                ] 
                                (delay (error)
                                )
                              ]
                            )
                          ) 
                          [
                            (letted 4294967295 head) 
                            purpFields
                          ]
                        ] 
                        [
                          (letted 4294967295 head) 
                          [
                            (letted 4294967295 tail) 
                            purpFields
                          ]
                        ]
                      ]
                    ) 
                    [
                      (letted 4294967295 snd) 
                      purpPair
                    ]
                  ]
                )
              ] 
              (delay (error)
              )
            ]
          ) 
          [
            (native equalsInteger) 
            [
              (letted 4294967295 fst) 
              purpPair
            ]
          ]
        ]
      ) 
      [
        (native unConstrData) 
        (letted 1 purpData)
      ]
    ]
  )
) {
  "letted": {
    "ifThenElse": {
      "dbn": 4294967295,
      "text": " (native ifThenElse)"
    },
    "tail": {
      "dbn": 4294967295,
      "text": " (native tailList)"
    },
    "add1": {
      "dbn": 4294967295,
      "text": " [ (native addInteger) (const int 1) ]"
    },
    "chooseList": {
      "dbn": 4294967295,
      "text": " (native chooseList)"
    },
    "length": {
      "dbn": 4294967295,
      "text": " (recursive self_a (func purpPair (force [ [ [ (letted 4294967295 chooseList) purpPair ] (const int 0) ] [ (letted 4294967295 add1) [ self_a [ (letted 4294967295 tail) purpPair ] ] ] ] ) ) )"
    },
    "head": {
      "dbn": 4294967295,
      "text": " (native headList)"
    },
    "snd": {
      "dbn": 4294967295,
      "text": " (native sndPair)"
    },
    "fst": {
      "dbn": 4294967295,
      "text": " (native fstPair)"
    },
    "ctxPair": {
      "dbn": 5,
      "text": " [ (native unConstrData) (-5) ]"
    },
    "ctxFields": {
      "dbn": 5,
      "text": " [ (letted 4294967295 snd) (letted 5 ctxPair) ]"
    },
    "txData": {
      "dbn": 5,
      "text": " [ (letted 4294967295 head) (letted 5 ctxFields) ]"
    },
    "drop2": {
      "dbn": 4294967295,
      "text": " (func ctxData [ (letted 4294967295 tail) [ (letted 4294967295 tail) ctxData ] ] )"
    },
    "purpData": {
      "dbn": 1,
      "text": " [ (letted 4294967295 head) [ (letted 4294967295 drop2) (letted 1 ctxFields) ] ]"
    }
  },
  "hoisted": {}
}
*/