import { DataConstr } from "@harmoniclabs/plutus-data";
import { bool, data, int, unit } from "../../../../type_system/types";
import { IRApp } from "../../../IRNodes/IRApp";
import { IRConst } from "../../../IRNodes/IRConst";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { IRHoisted } from "../../../IRNodes/IRHoisted";
import { IRNative } from "../../../IRNodes/IRNative";
import { IRNativeTag } from "../../../IRNodes/IRNative/IRNativeTag";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _ir_apps } from "../../../tree_utils/_ir_apps";
import { IRRecursive } from "../../../IRNodes/IRRecursive";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";

const hoisted_incr = new IRHoisted(
    new IRApp( IRNative.addInteger, IRConst.int( 1 ) )
);
hoisted_incr.hash;

const hoisted_decr = new IRHoisted(
    new IRApp( IRNative.addInteger, IRConst.int( -1 ) )
);
hoisted_decr.hash;

const hoisted_isZero = new IRHoisted(
    new IRApp( IRNative.equalsInteger, IRConst.int( 0 ) )
);
hoisted_isZero.hash;

const hoisted_isPositive = new IRHoisted(
    new IRApp( IRNative.lessThanInteger, IRConst.int( 0 ) )
);
hoisted_isPositive.hash;

const hoisted_isNonNegative = new IRHoisted(
    new IRApp( IRNative.lessThanEqualInteger, IRConst.int( 0 ) )
);
hoisted_isNonNegative.hash;

const innerZ = new IRFunc( 1, // f
    new IRApp(
        new IRVar( 1 ), // Z
        new IRFunc( 1,
            new IRApp(
                new IRApp(
                    new IRVar( 1 ), // toMakeRecursive
                    new IRVar( 1 )  // toMakeRecursive ( self )
                ),
                new IRVar( 0 ) // first argument (other than self)
            )
        )
    )
);
innerZ.hash;

const hoisted_z_comb = new IRHoisted(
    new IRFunc( 1, // Z
        new IRApp(
            innerZ.clone(),
            innerZ.clone()
        )
    )
);
hoisted_z_comb.hash;

const hoisted_matchList = new IRHoisted(
    new IRFunc( 3, // delayed_matchNil, matchCons, list
        new IRForced(
            new IRForced(
                _ir_apps(
                    IRNative.strictChooseList,
                    new IRVar( 0 ), // list, last argument of IRFunc above
                    new IRVar( 2 ), // delayed_matchNil (`delayed( resultT )`)
                    new IRDelayed( // delay
                        _ir_apps(
                            new IRVar( 1 ), // matchCons
                            new IRApp(
                                IRNative.headList,
                                new IRVar( 0 ) // list
                            ),
                            new IRApp(
                                IRNative.tailList,
                                new IRVar( 0 ) // list
                            ),
                        )
                    )
                )
            )
        )
    )
);
hoisted_matchList.hash;

//*
const hoisted_lazyIfThenElse = new IRHoisted(
    new IRFunc( 3, // condition, delayed_caseTrue, delayed_caseFalse
        new IRForced(
            _ir_apps(
                IRNative.strictIfThenElse,
                new IRVar( 2 ), // condition
                new IRVar( 1 ), // delayed_caseTrue
                new IRVar( 0 )  // delayed_caseFalse
            )
        )
    )
);
hoisted_lazyIfThenElse.hash;

const hosited_lazyChooseList = new IRHoisted(
    new IRFunc( 3, // list, delayed_caseNil, delayed_caseCons
        new IRForced(
            _ir_apps(
                IRNative.strictChooseList,
                new IRVar( 2 ),
                new IRVar( 1 ),
                new IRVar( 0 )
            )
        )
    )
);
hosited_lazyChooseList.hash;
//*/

const hoisted_dropList = new IRHoisted(
    new IRRecursive( // self,
        new IRFunc( 2, // lst, n
            new IRApp(
                new IRFunc( 1, // tailOfTheList (pletted)
                    new IRForced(
                        _ir_apps(
                            IRNative.strictIfThenElse.clone(),
                            _ir_apps(
                                hoisted_isZero.clone(),
                                new IRVar( 1 ) // n
                            ),
                            // then
                            new IRDelayed( new IRVar( 0 ) ), // tailOfTheList
                            // else
                            new IRDelayed(
                                _ir_apps(
                                    new IRSelfCall( 3 ), // self
                                    new IRVar( 0 ),  // tailOfTheList
                                    _ir_apps(
                                        hoisted_decr.clone(),
                                        new IRVar( 1 ), // n
                                    ),
                                )
                            )
                        )
                    )
                ),
                new IRApp(
                    IRNative.tailList,
                    new IRVar( 1 ) // lst
                )
            )
        )
    )
);
hoisted_dropList.hash;

const hoisted_recursiveList = new IRHoisted(
    new IRFunc(2, // matchNil (3), matchCons (2)
        new IRRecursive( // self (1)
            new IRFunc( 1, // lst (0)
                _ir_apps(
                    hoisted_matchList.clone(),
                    new IRApp(
                        new IRVar( 3 ), // matchNil
                        new IRSelfCall( 1 )  // self
                    ),
                    new IRApp(
                        new IRVar( 2 ), // matchCons,
                        new IRSelfCall( 1 )  // self
                    ),
                    new IRVar( 0 ), // lst
                )
            )
        )
    )
);
hoisted_recursiveList.hash;

const hoisted_lazyOr = new IRHoisted(
    new IRFunc( 2, // a(1), delayed_b (0)
        new IRForced(
            _ir_apps(
                IRNative.strictIfThenElse,
                new IRVar( 1 ), // a
                new IRDelayed( new IRConst( bool, true ) ), // a == true  -> true // const 7 bits; var 8 bits
                new IRVar( 0 )  // a == false -> whatever b is
            )
        )
    )
);
hoisted_lazyOr.hash;

const hoisted_lazyAnd = new IRHoisted(
    new IRFunc( 2, // a, b
        new IRForced(
            _ir_apps(
                IRNative.strictIfThenElse,
                new IRVar( 1 ), // a
                new IRVar( 0 ), // a == true  -> whatever b is
                new IRDelayed( new IRConst( bool, false ) )  // a == false -> false
            )
        )
    )
);
hoisted_lazyAnd.hash;

const hoisted_foldr = new IRHoisted(
    new IRFunc( 2, // reduceFunc, accmulator
        _ir_apps(
            hoisted_recursiveList.clone(),
            new IRFunc( 1, // _self
                new IRDelayed(
                    new IRVar( 1 ), // accumulator
                )
            ),
            new IRFunc( 3, // self, head, tail
                _ir_apps(
                    new IRVar( 4 ), // reduceFunc ( up to 2 are of callback, 3 is accum, 4 is reduce )
                    new IRVar( 1 ), // head
                    // strictly evaluated
                    // recursive call happens before this `reduce` call
                    new IRApp(
                        new IRVar( 2 ), // self
                        new IRVar( 0 )  // tail
                    )
                )
            )
        )
    )
);
hoisted_foldr.hash;

export function nativeToIR( native: IRNative ): IRTerm
{
    // positive natives are translated to uplc builtins (no need to hoist)
    if( native.tag >= 0 ) return native;

    switch( native.tag )
    {
        case IRNativeTag.z_comb         :
            return hoisted_z_comb.clone();
        break;
        case IRNativeTag._matchList     :
            return hoisted_matchList.clone();
        break;
        case IRNativeTag._recursiveList :
            return hoisted_recursiveList.clone();
        break;
        case IRNativeTag._dropList     :
            return hoisted_dropList.clone()
        break;
        case IRNativeTag._indexList     :
            return new IRHoisted(
                new IRFunc( 2, // lst, n
                    new IRApp( // drop n and take head
                        IRNative.headList,
                        _ir_apps(
                            hoisted_dropList.clone(),
                            new IRVar( 1 ), // lst
                            new IRVar( 0 )  // n
                        )
                    )
                )
            );
        break;
        case IRNativeTag._foldr         :
            return hoisted_foldr.clone();
        break;
        case IRNativeTag._foldl         :
            return new IRHoisted(
                new IRFunc( 1, // reduceFunc (4)
                    new IRRecursive( // self (3)
                        new IRFunc( 1, // accum (2)
                            _ir_apps(
                                hoisted_matchList.clone(),
                                new IRDelayed( new IRVar( 0 ) ), // pdelay( accum )
                                new IRFunc( 2, // head (1), tail (0)
                                    _ir_apps(
                                        new IRSelfCall( 3 ), // self
                                        // compute new accumoulator before proceeding
                                        _ir_apps(
                                            new IRVar( 4 ), // reduceFunc
                                            new IRVar( 2 ), // accum
                                            new IRVar( 1 ), // head
                                        ),
                                        new IRVar( 0 ) // tail
                                    )
                                )
                            )
                        )
                    )
                )
            );
        break;
        case IRNativeTag._mkFindData          :
            return new IRHoisted(
                new IRFunc( 2, // elemToData (4), predicate (3)
                    new IRRecursive( // self (2)
                        new IRFunc( 1, // list (1)
                            new IRForced(
                                _ir_apps(
                                    new IRApp(
                                        IRNative.strictChooseList,
                                        new IRVar( 0 ) // list
                                    ),
                                    // then (caseNil)
                                    // Nothing data
                                    new IRDelayed(
                                        new IRConst(
                                            data,
                                            new DataConstr( 1, [] ) // Nothing is the second contructor
                                        )
                                    ),
                                    // else // caseCons
                                    new IRDelayed(
                                        new IRApp(
                                            new IRFunc( 1, // head (0) (pletted)
                                                new IRForced(
                                                    _ir_apps(
                                                        IRNative.strictIfThenElse,
                                                        new IRApp(
                                                            new IRVar( 3 ), // predicate
                                                            new IRVar( 0 )  // head
                                                        ),
                                                        // then
                                                        new IRDelayed(
                                                            _ir_apps(
                                                                IRNative.constrData,
                                                                new IRConst( int, 0 ), // just contructor
                                                                new IRApp(
                                                                    new IRVar( 4 ), // elemToData
                                                                    new IRVar( 0 )  // head
                                                                )
                                                            )
                                                        ),
                                                        // else
                                                        new IRDelayed(
                                                            new IRApp(
                                                                new IRSelfCall( 2 ), // self
                                                                new IRApp(
                                                                    IRNative.tailList,
                                                                    new IRVar( 1 ) // list
                                                                )
                                                            )
                                                        )
                                                    )
                                                )
                                            ),
                                            new IRApp(
                                                IRNative.headList,
                                                new IRVar( 0 ) // list
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
        break;
        case IRNativeTag._length        :
            return new IRHoisted(
                new IRRecursive( // self
                    new IRFunc( 1, // list
                        new IRForced(
                            _ir_apps(
                                new IRApp(
                                    IRNative.strictChooseList,
                                    new IRVar( 0 )  // list
                                ),
                                // then
                                new IRConst( int, 0 ),
                                // else
                                _ir_apps(
                                    hoisted_incr.clone(),
                                    new IRApp(
                                        new IRSelfCall( 1 ), // self
                                        new IRApp(      // list.tail
                                            IRNative.tailList,
                                            new IRVar( 0 )  // list
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
        break;
        case IRNativeTag._some          :
            return new IRHoisted(
                new IRFunc( 1, // predicate
                    _ir_apps(
                        hoisted_recursiveList.clone(),
                        new IRFunc( 1, // _self
                            new IRDelayed( // pdelay( pBool( true ) )
                                new IRConst( bool, false ), // if empty then none of the list satisfies the predicate
                            )
                        ),
                        new IRFunc( 3, // self, head, tail
                            _ir_apps(
                                hoisted_lazyOr.clone(), // lazy in second
                                new IRApp(
                                    new IRVar( 3 ), // predicate ( 0, 1, 2 are of callback, 3 is predicate )
                                    new IRVar( 1 ), // head
                                ),
                                new IRDelayed(
                                    new IRApp(
                                        new IRVar( 2 ), // self
                                        new IRVar( 0 )  // tail
                                    )
                                )
                            )
                        )
                    )
                )
            );
        break;
        case IRNativeTag._every         :
            return new IRHoisted(
                new IRFunc( 1, // predicate
                    _ir_apps(
                        hoisted_recursiveList.clone(),
                        new IRFunc( 1, // _self
                            new IRDelayed( // pdelay( pBool( true ) )
                                new IRConst( bool, true ), // if empty then all elems of the list are satisfying the predicate
                            )
                        ),
                        new IRFunc( 3, // self, head, tail
                            _ir_apps(
                                hoisted_lazyAnd.clone(), // lazy in second
                                new IRApp(
                                    new IRVar( 3 ), // predicate ( 0, 1, 2 are of callback, 3 is predicate )
                                    new IRVar( 1 ), // head
                                ),
                                new IRDelayed(
                                    new IRApp(
                                        new IRVar( 2 ), // self
                                        new IRVar( 0 )  // tail
                                    )
                                )
                            )
                        )
                    )
                )
            );
        break;
        case IRNativeTag._mkFilter        :
            return new IRHoisted(
                new IRFunc( 2, // pnilOfType, predicate
                    _ir_apps(
                        hoisted_foldr.clone(),
                        new IRFunc( 2, // elem, accum
                            new IRForced(
                                _ir_apps(
                                    IRNative.strictIfThenElse,
                                    new IRApp(
                                        new IRVar( 2 ), // predicate
                                        new IRVar( 1 )  // elem
                                    ),
                                    // then
                                    new IRDelayed(
                                        _ir_apps(
                                            IRNative.mkCons,
                                            new IRVar( 1 ), // elem
                                            new IRVar( 0 )  // accum
                                        )
                                    ),
                                    // else
                                    // filter out this element
                                    new IRDelayed(
                                        new IRVar( 0 )  // accum
                                    )
                                )
                            ),
                        ),
                        // initial accum
                        new IRVar( 3 )  // pnilOfType
                    )
                )
            );
        break;
        // case IRNativeTag._fstPair       :
        //     return new IRHoisted();
        // break;
        // case IRNativeTag._sndPair       :
        //     return new IRHoisted();
        // break;
        case IRNativeTag._id            :
            return new IRHoisted(
                new IRFunc( 1, new IRVar(0) )
            );
        break;
        case IRNativeTag._not           :
            return new IRHoisted(
                new IRFunc( 1, // someBool
                    _ir_apps(
                        IRNative.strictIfThenElse,
                        new IRVar( 0 ), // someBool
                        new IRConst( bool, false ), // someBool == true  -> false
                        new IRConst( bool, true  )  // someBool == false -> true 
                    )
                )
            );
        break;
        case IRNativeTag._strictAnd     :
            return new IRHoisted(
                new IRFunc( 2, // a, b
                    _ir_apps(
                        IRNative.strictIfThenElse,
                        new IRVar( 1 ), // a
                        new IRVar( 0 ), // a == true  -> whatever b is
                        new IRConst( bool, false )  // a == false -> false
                    )
                )
            );
        break;
        case IRNativeTag._and           :
            return hoisted_lazyAnd.clone();
        break;
        case IRNativeTag._strictOr      :
            return new IRHoisted(
                new IRFunc( 2, // a, b
                    _ir_apps(
                        IRNative.strictIfThenElse,
                        new IRVar( 1 ), // a
                        new IRConst( bool, true ), // a == true  -> true
                        new IRVar( 0 )  // a == false -> whatever b is
                    )
                )
            );
        break;
        case IRNativeTag._or            :
            return hoisted_lazyOr.clone();
        break;
        case IRNativeTag._gtBS          :
            return new IRHoisted(
                new IRFunc( 2, // a, b
                    _ir_apps(
                        IRNative.lessThanByteString,
                        new IRVar( 0 ), // b
                        new IRVar( 1 ), // a
                    )
                )
            );
        break;
        case IRNativeTag._gtEqBS        :
            return new IRHoisted(
                new IRFunc( 2, // a, b
                    _ir_apps(
                        IRNative.lessThanEqualsByteString,
                        new IRVar( 0 ), // b
                        new IRVar( 1 ), // a
                    )
                )
            );
        break;
        case IRNativeTag._gtInt         :
            return new IRHoisted(
                new IRFunc( 2, // a, b
                    _ir_apps(
                        IRNative.lessThanInteger,
                        new IRVar( 0 ), // b
                        new IRVar( 1 ), // a
                    )
                )
            );
        break;
        case IRNativeTag._gtEqInt       :
            return new IRHoisted(
                new IRFunc( 2, // a, b
                    _ir_apps(
                        IRNative.lessThanEqualInteger,
                        new IRVar( 0 ), // b
                        new IRVar( 1 ), // a
                    )
                )
            );
        break;
        case IRNativeTag._strToData     :
            return new IRHoisted(
                new IRFunc( 1, // str
                    new IRApp(
                        IRNative.bData,
                        new IRApp(
                            IRNative.encodeUtf8,
                            new IRVar( 0 ) // str
                        )
                    )
                )
            );
        break;
        case IRNativeTag._pairDataToData    :
            return new IRHoisted(
                new IRFunc( 1, // pair
                    new IRApp(
                        IRNative.listData,
                        _ir_apps(
                            IRNative.mkCons,
                            new IRApp(
                                IRNative.fstPair,
                                new IRVar( 0 )
                            ),
                            _ir_apps(
                                IRNative.mkCons,
                                new IRApp(
                                    IRNative.sndPair,
                                    new IRVar( 0 )
                                ),
                                new IRApp(
                                    IRNative.mkNilData,
                                    new IRConst( unit, undefined )
                                )
                            )
                        )
                    )
                )
            );
        break;
        case IRNativeTag._strFromData   :
            return new IRHoisted(
                new IRFunc( 1, // data
                    new IRApp(
                        IRNative.decodeUtf8,
                        new IRApp(
                            IRNative.unBData,
                            new IRVar( 0 ) // data
                        )
                    )
                )
            );
        break;
        case IRNativeTag._pairDataFromData  :
            return new IRHoisted(
                new IRFunc( 1, // data
                    new IRApp(
                        new IRFunc( 1, // unlisted_data
                            _ir_apps(
                                IRNative.mkPairData,
                                new IRApp(
                                    IRNative.headList,
                                    new IRVar( 0 )  // unlised_data
                                ),
                                new IRApp(
                                    IRNative.headList,
                                    new IRApp(
                                        IRNative.tailList,
                                        new IRVar( 0 )  // unlised_data
                                    )
                                )
                            )
                        ),
                        new IRApp(
                            IRNative.unListData,
                            new IRVar( 0 ) // data
                        )
                    )
                )
            );
        break;
        case IRNativeTag._lazyChooseList:
            return hosited_lazyChooseList.clone();
        break;
        case IRNativeTag._lazyIfThenElse:
            return hoisted_lazyIfThenElse.clone()
        break;

        default: throw new Error("unknown (negative) native calling 'nativeToIR'")
    }
}