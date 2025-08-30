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
import { IRError } from "../../../IRNodes";
import { _ir_let } from "../../../tree_utils/_ir_let";

const hoisted_id = new IRHoisted(
    new IRFunc( 1, new IRVar(0) )
);
hoisted_id.hash;

const hoisted_not = new IRHoisted(
    new IRFunc( 1, // someBool
        _ir_apps(
            IRNative.strictIfThenElse,
            new IRVar( 0 ), // someBool
            IRConst.bool( false ), // someBool == true  -> false
            IRConst.bool( true  )  // someBool == false -> true 
        )
    )
);
hoisted_not.hash;

const hoisted_drop2 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            IRNative.tailList,
            _ir_apps(
                IRNative.tailList,
                new IRVar( 0 ) // lst
            )
        )
    )
);
hoisted_drop2.hash;

const hoisted_drop3 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            IRNative.tailList,
            _ir_apps(
                IRNative.tailList,
                _ir_apps(
                    IRNative.tailList,
                    new IRVar( 0 ) // lst
                )
            )
        )
    )
);
hoisted_drop3.hash;

const hoisted_drop4 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            IRNative.tailList,
            _ir_apps(
                IRNative.tailList,
                _ir_apps(
                    IRNative.tailList,
                    _ir_apps(
                        IRNative.tailList,
                        new IRVar( 0 ) // lst
                    )
                )
            )
        )
    )
);
hoisted_drop4.hash;

const hoisted_drop8 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            hoisted_drop4.clone(),
            _ir_apps(
                hoisted_drop4.clone(),
                new IRVar( 0 ) // lst
            )
        )
    )
);
hoisted_drop8.hash;

const hoisted_drop16 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            hoisted_drop8.clone(),
            _ir_apps(
                hoisted_drop8.clone(),
                new IRVar( 0 ) // lst
            )
        )
    )
);
hoisted_drop16.hash;

const hoisted_drop32 = new IRHoisted(
    new IRFunc( 1, // lst
        _ir_apps(
            hoisted_drop16.clone(),
            _ir_apps(
                hoisted_drop16.clone(),
                new IRVar( 0 ) // lst
            )
        )
    )
);
hoisted_drop32.hash;

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

const hoisted_isOne = new IRHoisted(
    new IRApp( IRNative.equalsInteger, IRConst.int( 1 ) )
);
hoisted_isZero.hash;

const hoisted_addOne = new IRHoisted(
    new IRApp( IRNative.addInteger, IRConst.int( 1 ) )
);
hoisted_addOne.hash;

const hoisted_subOne = new IRHoisted(
    new IRApp( IRNative.addInteger, IRConst.int( -1 ) )
);
hoisted_subOne.hash;

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
                new IRDelayed( IRConst.bool( true ) ), // a == true  -> true // const 7 bits; var 8 bits
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
                new IRDelayed( IRConst.bool( false ) )  // a == false -> false
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

const MAX_WORD4 = BigInt( 1 ) << BigInt( 32 );

const hoisted_sizeofPositiveInt = new IRHoisted(
    _ir_apps(
        new IRRecursive( // self
            new IRFunc( 2, // count_words, n
                new IRForced(_ir_apps(
                    IRNative.strictIfThenElse,
                    _ir_apps(
                        hoisted_isZero.clone(),
                        new IRVar( 0 ) // n
                    ),
                    // then n === 0
                    new IRDelayed(
                        new IRForced(_ir_apps(
                            IRNative.strictIfThenElse,
                            _ir_apps(
                                hoisted_isZero.clone(),
                                new IRVar( 1 ) // count_words
                            ),
                            // then count_words === 0
                            // at least one word is needed to represent 0, so we return 4 bytes (1 word)
                            new IRDelayed( IRConst.int( 4 ) ),
                            // else count_words > 0
                            // return count_words * 4
                            new IRDelayed(
                                _ir_apps(
                                    IRNative.multiplyInteger,
                                    IRConst.int( 4 ),
                                    new IRVar( 1 )
                                )
                            )
                        ))
                    ),
                    // else n > 0
                    new IRDelayed(
                        _ir_apps(
                            new IRSelfCall( 2 ), // self
                            _ir_apps(
                                hoisted_addOne.clone(),
                                new IRVar( 1 ) // count_words
                            ),
                            _ir_apps(
                                IRNative.divideInteger,
                                new IRVar( 0 ), // n
                                IRConst.int( MAX_WORD4 )
                            )
                        )
                    )
                ))
            )
        ),
        IRConst.int( 0 ), // initial count_words
    )
);

export function nativeToIR( native: IRNative ): IRTerm
{
    // positive natives are translated to uplc builtins (no need to hoist)
    if( native.tag >= 0 ) return native;

    switch( native.tag )
    {
        /*
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
        //*/
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
        case IRNativeTag._mkFindDataOptional          :
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
                                        IRConst.data(
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
                                                                IRConst.int( 0 ), // just contructor
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
                                IRConst.int( 0 ),
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
                                IRConst.bool( false ), // if empty then none of the list satisfies the predicate
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
                                IRConst.bool( true ), // if empty then all elems of the list are satisfying the predicate
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
            return hoisted_id.clone();
        break;
        case IRNativeTag._not           :
            return hoisted_not.clone();
        break;
        case IRNativeTag._strictAnd     :
            return new IRHoisted(
                new IRFunc( 2, // a, b
                    _ir_apps(
                        IRNative.strictIfThenElse,
                        new IRVar( 1 ), // a
                        new IRVar( 0 ), // a == true  -> whatever b is
                        IRConst.bool( false )  // a == false -> false
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
                        IRConst.bool( true ), // a == true  -> true
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
                                    IRConst.unit
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
        case IRNativeTag._mkMapList: {
            return new IRHoisted(
                new IRFunc( 2, // nilListOfType, mapFn
                    new IRRecursive( // self
                        new IRFunc( 1, // lst
                            new IRForced(
                                _ir_apps(
                                    IRNative.strictChooseList,
                                    new IRVar( 0 ), // lst
                                    // case Nil
                                    new IRDelayed( new IRVar( 3 ) ), // delay( nilListOfType )
                                    // case Cons
                                    new IRDelayed(
                                        _ir_apps(
                                            IRNative.mkCons,
                                            _ir_apps(
                                                new IRVar( 2 ), // mapFn
                                                _ir_apps(
                                                    IRNative.headList,
                                                    new IRVar( 0 ) // lst
                                                )
                                            ),
                                            _ir_apps(
                                                new IRSelfCall( 1 ), // self
                                                _ir_apps(
                                                    IRNative.tailList,
                                                    new IRVar( 0 ) // lst
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        }
        break;
        case IRNativeTag._equalBoolean: {
            return new IRHoisted(
                new IRFunc( 1,
                    _ir_apps(
                        IRNative.strictIfThenElse,
                        new IRVar( 0 ), // a
                        hoisted_id.clone(), // a == true  -> true
                        hoisted_not.clone()  // a == false -> b ? false : true
                    )
                )
            )
        }
        break;
        case IRNativeTag._negateInt: {
            return new IRHoisted(
                _ir_apps(
                    IRNative.subtractInteger,
                    IRConst.int( 0 ),
                )
            );
        }
        break;
        case IRNativeTag._bytesToIntBE: {
            return new IRHoisted(
                _ir_apps(
                    IRNative.byteStringToInteger,
                    IRConst.bool( true ) // big endian
                )
            );
        }
        break;
        case IRNativeTag._boolToInt: {
            return new IRHoisted(
                new IRFunc( 1, // bool
                    _ir_apps(
                        IRNative.strictIfThenElse,
                        new IRVar( 0 ), // bool
                        IRConst.int( 1 ), // b == true  -> 1
                        IRConst.int( 0 )  // b == false -> 0
                    )
                )
            )
        }
        break;
        case IRNativeTag._intToBytesBE: {
            return new IRHoisted(
                new IRFunc( 1, // int
                    _ir_apps(
                        IRNative.integerToByteString,
                        IRConst.bool( true ), // big endian
                        _ir_apps( // int size
                            hoisted_sizeofPositiveInt.clone(),
                            // integerToByteString fails for negative integers
                            // so we don't bother converting negative to positive here
                            new IRVar( 0 ) // int
                        ),
                        new IRVar( 0 )  // int
                    )
                )
            );
        }
        break;
        case IRNativeTag._intToBool: {
            return hoisted_isNonNegative.clone();
        }
        break;
        case IRNativeTag._exponentiateInteger: {
            return new IRHoisted(
                new IRFunc( 2, // base, exponent
                    new IRForced(_ir_apps(
                        IRNative.strictIfThenElse,
                        _ir_apps(
                            hoisted_isNonNegative.clone(),
                            new IRVar( 0 ) // exponent
                        ),
                        // then, normal exponentiation
                        new IRDelayed(
                            new IRRecursive(new IRFunc(2, // expInt, x, n
                                    new IRForced(_ir_apps(
                                    IRNative.strictIfThenElse,
                                    _ir_apps(
                                        hoisted_isZero.clone(),
                                        new IRVar( 0 ) // n
                                    ),
                                    // then (n == 0)
                                    // yes, even `0 ** 0` is 1
                                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation#description
                                    new IRDelayed( IRConst.int( 1 ) ), // return 1
                                    // else (n > 0)
                                    new IRDelayed(
                                        new IRForced(_ir_apps(
                                            IRNative.strictIfThenElse,
                                            _ir_apps(
                                                hoisted_isOne.clone(),
                                                new IRVar( 0 ) // n
                                            ),
                                            // then (n == 1)
                                            new IRDelayed( new IRVar( 1 ) ), // return x
                                            // else (n > 1)
                                            new IRDelayed(
                                                new IRForced(_ir_apps(
                                                    IRNative.strictIfThenElse,
                                                    _ir_apps(
                                                        hoisted_isZero.clone(),
                                                        _ir_apps(
                                                            IRNative.modInteger,
                                                            new IRVar( 0 ), // exponent
                                                            IRConst.int( 2 )
                                                        )
                                                    ),
                                                    // then (exponent % 2 == 0)
                                                    new IRDelayed(
                                                        _ir_let(
                                                            _ir_apps(
                                                                new IRSelfCall( 2 ), // expInt
                                                                new IRVar( 1 ), // x
                                                                _ir_apps(
                                                                    IRNative.divideInteger,
                                                                    new IRVar( 0 ), // exponent
                                                                    IRConst.int( 2 )
                                                                )
                                                            ), // half
                                                            _ir_apps(
                                                                IRNative.multiplyInteger,
                                                                new IRVar( 0 ), // half
                                                                new IRVar( 0 )  // half
                                                            )
                                                        )
                                                    ),
                                                    // else (exponent % 2 == 1)
                                                    new IRDelayed(
                                                        _ir_apps( // x * expInt( x, n - 1 )
                                                            IRNative.multiplyInteger,
                                                            new IRVar( 1 ), // x
                                                            _ir_apps(
                                                                new IRSelfCall( 2 ), // expInt
                                                                new IRVar( 1 ), // x
                                                                _ir_apps(
                                                                    hoisted_subOne.clone(),
                                                                    new IRVar( 0 ), // n
                                                                )
                                                            )
                                                        )
                                                    )
                                                ))
                                            )
                                        ))
                                    ),
                                ))
                            ))
                        ),
                        // else (exponent < 0) fails
                        new IRDelayed( new IRError() )
                    ))
                )
            );
        }
        break;

        default: throw new Error("unknown (negative) native calling 'nativeToIR'")
    }
}