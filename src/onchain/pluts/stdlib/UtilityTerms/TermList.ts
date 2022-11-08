
import BasePlutsError from "../../../../errors/BasePlutsError";
import ObjectUtils from "../../../../utils/ObjectUtils";
import PType, { PDataRepresentable } from "../../PType"
import PBool from "../../PTypes/PBool";
import PLam, { TermFn } from "../../PTypes/PFn/PLam";
import PInt from "../../PTypes/PInt";
import PList from "../../PTypes/PList"
import { phoist } from "../../Syntax/syntax";
import Term from "../../Term";
import { ConstantableTermType, TermType, ToPType } from "../../Term/Type/base";
import { isConstantableTermType, isLambdaType } from "../../Term/Type/kinds";
import { termTypeToString } from "../../Term/Type/utils";
import { phead, pprepend, ptail } from "../Builtins";
import { plength } from "../List";
import { pevery, pfilter, pfind, pfindList, pindexList, pmap, psome } from "../List/methods";
import { pflip } from "../PCombinators";
import { PMaybeT } from "../PMaybe/PMaybe";
import { UtilityTermOf } from "./addUtilityForType";
import TermBool from "./TermBool";
import TermInt from "./TermInt";
import { TryUtitlityFromPType } from "./types";

type TermList<PElemsT extends PDataRepresentable> = Term<PList<PElemsT>>
& {
    /**
     * **O(1)**
     * 
     * @returns the first element fo the list
     * 
     * > **fails the smart contract with `perror`** if the list is empty
     */
    readonly head: TryUtitlityFromPType<PElemsT>
    /**
     * **O(1)**
     * 
     * @returns a list containing the same elements of the one called on exept for the first
     * 
     * js equivalent:
     * ```js
     * list.slice(1)
     * ```
     * 
     * > **fails the smart contract with `perror`** if the list is empty
     */
    readonly tail: TermList<PElemsT>
    /**
     * **O(n)**
     * 
     * @returns the length of the list
     * 
     * > **suggestion**: use `plet` bindings if you need to access the list length more than once
     * >
     * > example:
     * > ```ts
     * > plet( list.length ).in( length => ... )
     * > ```
     */
    readonly length: TermInt

    // indexing / query
    readonly atTerm:    TermFn<[PInt], PElemsT>
    readonly at:        ( index: Term<PInt> ) => UtilityTermOf<PElemsT> 
    
    readonly findTerm:  TermFn<[PLam<PElemsT,PBool>], PMaybeT<PElemsT>>
    readonly find:      ( predicate: Term<PLam<PElemsT,PBool>> ) => Term<PMaybeT<PElemsT>>

    // readonly includes: TermFn<[PElemsT], PBool>
    // readonly findIndex: TermFn<[PLam<PElemsT,PBool>], PInt>
    readonly filterTerm:    TermFn<[PLam<PElemsT,PBool>], PList<PElemsT>>
    readonly filter:        ( predicate: Term<PLam<PElemsT,PBool>> ) => Term<PList<PElemsT>>

    // list creation
    readonly preprendTerm:  TermFn<[PElemsT], PList<PElemsT>>
    readonly preprend:      ( elem: Term<PElemsT> ) => TermList<PElemsT>
    // readonly concat: TermFn<[PList<PElemsT>], PList<PElemsT>>
    
    // transform
    readonly mapTerm: <ResultT extends ConstantableTermType>( resultT: ResultT ) => TermFn<[PLam<PElemsT, ToPType<ResultT>>], ToPType<ResultT>>
    readonly map:     <PResultElemT extends PType>( f: Term<PLam<PElemsT,PResultElemT>> ) => UtilityTermOf<PResultElemT>
    // readonly reduce: <ResultT extends ConstantableTermType>( resultT: ResultT ) => TermFn<[PLam<ToPType<ResultT>, PLam<PList<PElemsT>, ToPType<ResultT>>>], ToPType<ResultT>> 

    // predicates
    readonly everyTerm: TermFn<[PLam<PElemsT, PBool>], PBool>
    readonly every:     ( predicate: Term<PLam<PElemsT, PBool>> ) => TermBool
    
    readonly someTerm:  TermFn<[PLam<PElemsT, PBool>], PBool>
    readonly some:      ( predicate: Term<PLam<PElemsT, PBool>> ) => TermBool
};

export default TermList;

function getHoistedFlipped<T extends TermType | ConstantableTermType, PSomething extends PType, PReturnT extends PType >( 
    pfunc: (elemsT: T) => TermFn<[ PSomething, PList<ToPType<T>> ], PReturnT>
): (elemsT: T) => TermFn<[ PList<ToPType<T>>, PSomething ], PReturnT>
{
    return ( elemsT ) => phoist( pflip.$( pfunc( elemsT ) ) ) as any;
}

const flippedPrepend = getHoistedFlipped( pprepend );
const flippedFind = ( t: ConstantableTermType ) => phoist( pflip.$( pfind( t ) ) )
const flippedFilter = getHoistedFlipped( pfilter );
const flippedEvery = getHoistedFlipped( pevery )
const flippedSome = getHoistedFlipped( psome )

export function addPListMethods<PElemsT extends PType>( list: Term<PList<PElemsT>> )
    : TermList<PElemsT>
{
    const elemsT = list.type[1] as ConstantableTermType;

    ObjectUtils.definePropertyIfNotPresent(
        list,
        "head",
        {
            get: () => phead( elemsT ).$( list ) ,
            set: () => {},
            configurable: false,
            enumerable: true
        }
    );
    ObjectUtils.definePropertyIfNotPresent(
        list,
        "tail",
        {
            get: () => ptail( elemsT ).$( list ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    );
    ObjectUtils.definePropertyIfNotPresent(
        list,
        "length",
        {
            get: () => plength.$( list ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "atTerm",
        pindexList( elemsT ).$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "at",
        ( index: Term<PInt> ): UtilityTermOf<PElemsT> => pindexList( elemsT ).$( list ).$( index ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "findTerm",
        flippedFind( elemsT ).$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "find",
        ( predicate: Term<PLam<PElemsT,PBool>> ): Term<PMaybeT<PElemsT>> => 
            pfind( elemsT ).$( predicate ).$( list ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "filterTerm",
        flippedFilter( elemsT ).$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "filter",
        ( predicate: Term<PLam<PElemsT,PBool>> ): TermList<PElemsT> =>
            pfilter( elemsT ).$( predicate ).$( list ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "prependTerm",
        flippedPrepend( elemsT ).$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "prepend",
        ( elem: Term<PElemsT> ): TermList<PElemsT> => pprepend( elemsT ).$( elem ).$( list ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "mapTerm",
        ( toType: ConstantableTermType ) => 
            phoist( pflip.$( pmap( elemsT, toType ) ) )
            .$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "map",
        <PReturnElemT extends PType>( f: Term<PLam<PElemsT,PReturnElemT>> ) => {
            const predicateTy = f.type;
            if(!(
                isLambdaType( predicateTy ) &&
                isConstantableTermType( predicateTy[2] )
            ))
            throw new BasePlutsError(
                `can't map plu-ts fuction of type "${predicateTy}" over a list of type "list(${termTypeToString(elemsT)})"`
            );

            return pmap( elemsT, predicateTy[2] ).$( f ).$( list );
        }
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "everyTerm",
        flippedEvery( elemsT )
        .$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "every",
        ( predicate: Term<PLam<PElemsT, PBool>> ): TermBool => pevery( elemsT ).$( predicate ).$( list )
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "someTerm",
        flippedSome( elemsT )
        .$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "some",
        ( predicate: Term<PLam<PElemsT, PBool>> ): TermBool => psome( elemsT ).$( predicate ).$( list )
    );
    
    return list as any;
}

