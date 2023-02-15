import { BasePlutsError } from "../../../../../errors/BasePlutsError";
import ObjectUtils from "../../../../../utils/ObjectUtils";
import { PType } from "../../../PType";
import { PDataRepresentable } from "../../../PType/PDataRepresentable";
import type { PList, TermFn, PInt, PLam, PBool } from "../../../PTypes";
import { Term } from "../../../Term";
import { ToPType, TermType, unwrapAlias, isTaggedAsAlias, isWellFormedGenericType, PrimType } from "../../../type_system";
import { termTypeToString } from "../../../type_system/utils";
import { UtilityTermOf } from "../../addUtilityForType";
import { phead, ptail } from "../../builtins";
import { pprepend } from "../../builtins/pprepend";
import { PappArg } from "../../pappArg";
import { phoist } from "../../phoist";
import { PMaybeT } from "../PMaybe";
import { pflip } from "../combinators";
import { pevery } from "../list/pevery";
import { pfilter } from "../list/pfilter";
import { pfind } from "../list/pfind";
import { pindexList } from "../list/pindexList";
import { plength } from "../list/plength";
import { pmap } from "../list/pmap";
import { preverse } from "../list/preverse";
import { psome } from "../list/psome";
import { TermBool } from "./TermBool";
import { TermInt } from "./TermInt";


export type TermList<PElemsT extends PDataRepresentable> = Term<PList<PElemsT>> & {

    /**
     * **O(1)**
     * 
     * @returns the first element fo the list
     * 
     * > **fails the smart contract with `perror`** if the list is empty
     */
    readonly head: UtilityTermOf<PElemsT>
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
    /**
     * **O(n)**
     * 
     * @returns a new list with the same elements in the opposite order
     * 
     * > **suggestion**: use `plet` bindings if you need to access the list length more than once
     * >
     * > example:
     * > ```ts
     * > plet( list.reversed ).in( reversed => ... )
     * > ```
    **/
    readonly reversed: TermList<PElemsT>

    // indexing / query
    readonly atTerm:    TermFn<[PInt], PElemsT>
    readonly at:        ( index: PappArg<PInt> ) => UtilityTermOf<PElemsT> 
    
    readonly findTerm:  TermFn<[PLam<PElemsT,PBool>], PMaybeT<PElemsT>>
    readonly find:      ( predicate: PappArg<PLam<PElemsT,PBool>> ) => Term<PMaybeT<PElemsT>>

    // readonly includes: TermFn<[PElemsT], PBool>
    // readonly findIndex: TermFn<[PLam<PElemsT,PBool>], PInt>
    readonly filterTerm:    TermFn<[PLam<PElemsT,PBool>], PList<PElemsT>>
    readonly filter:        ( predicate: PappArg<PLam<PElemsT,PBool>> ) => TermList<PElemsT>

    // list creation
    readonly prependTerm:  TermFn<[PElemsT], PList<PElemsT>>
    readonly prepend:      ( elem: PappArg<PElemsT> ) => TermList<PElemsT>
    // readonly concat: TermFn<[PList<PElemsT>], PList<PElemsT>>
    
    // transform
    readonly mapTerm: <ResultT extends TermType>( resultT: ResultT ) => TermFn<[PLam<PElemsT, ToPType<ResultT>>], PList<ToPType<ResultT>>>
    readonly map:     <PResultElemT extends PType>( f: PappArg<PLam<PElemsT,PResultElemT>> ) => TermList<PResultElemT>
    // readonly reduce: <ResultT extends TermType>( resultT: ResultT ) => TermFn<[PLam<ToPType<ResultT>, PLam<PList<PElemsT>, ToPType<ResultT>>>], ToPType<ResultT>> 

    // predicates
    readonly everyTerm: TermFn<[PLam<PElemsT, PBool>], PBool>
    readonly every:     ( predicate: PappArg<PLam<PElemsT, PBool>> ) => TermBool
    
    readonly someTerm:  TermFn<[PLam<PElemsT, PBool>], PBool>
    readonly some:      ( predicate: PappArg<PLam<PElemsT, PBool>> ) => TermBool
};

function getHoistedFlipped<T extends TermType | TermType, PSomething extends PType, PReturnT extends PType >( 
    pfunc: (elemsT: T) => TermFn<[ PSomething, PList<ToPType<T>> ], PReturnT>
): (elemsT: T) => TermFn<[ PList<ToPType<T>>, PSomething ], PReturnT>
{
    return ( elemsT ) => phoist( pflip.$( pfunc( elemsT ) ) ) as any;
}

const flippedPrepend = getHoistedFlipped( pprepend );
const flippedFind = ( t: TermType ) => phoist( pflip.$( pfind( t ) ) )
const flippedFilter = getHoistedFlipped( pfilter );
const flippedEvery = getHoistedFlipped( pevery )
const flippedSome = getHoistedFlipped( psome )

export function addPListMethods<PElemsT extends PType>( list: Term<PList<PElemsT>> )
    : TermList<PElemsT>
{
    const elemsT = (isTaggedAsAlias( list.type ) ? unwrapAlias( list.type )[1] : list.type[1]) as TermType;
    if(!isWellFormedGenericType( elemsT as any ))
    {
        throw new BasePlutsError(
            "`addPListMethods` can only be used on lists with concrete types; the type of the list was: " + termTypeToString( list.type )
        );
    }

    // console.log( "addPMethods; __isListOfDynPairs", (list as any).__isListOfDynPairs )

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
            get: () => plength( elemsT ).$( list ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    );
    ObjectUtils.definePropertyIfNotPresent(
        list,
        "reversed",
        {
            get: () => preverse( elemsT ).$( list ),
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
        ( index: PappArg<PInt> ): UtilityTermOf<PElemsT> => pindexList( elemsT ).$( list ).$( index ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "findTerm",
        flippedFind( elemsT ).$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "find",
        ( predicate: PappArg<PLam<PElemsT,PBool>> ): Term<PMaybeT<PElemsT>> => 
            pfind( elemsT ).$( predicate as any ).$( list ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "filterTerm",
        flippedFilter( elemsT ).$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "filter",
        ( predicate: PappArg<PLam<PElemsT,PBool>> ): TermList<PElemsT> =>
            pfilter( elemsT ).$( predicate as any ).$( list ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "prependTerm",
        flippedPrepend( elemsT ).$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "prepend",
        ( elem: PappArg<PElemsT> ): TermList<PElemsT> => pprepend( elemsT ).$( elem ).$( list ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        list,
        "mapTerm",
        ( toType: TermType ) => 
            phoist( pflip.$( pmap( elemsT, toType ) ) )
            .$( list )
    );
    ObjectUtils.defineReadOnlyProperty(
        list,
        "map",
        <PReturnElemT extends PType>( f: Term<PLam<PElemsT,PReturnElemT>> ) => {
            const predicateTy = f.type;
            if(!(
                predicateTy[0] === PrimType.Lambda &&
                isWellFormedGenericType( predicateTy[2] )
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
        ( predicate: PappArg<PLam<PElemsT, PBool>> ): TermBool => pevery( elemsT ).$( predicate as any ).$( list )
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
        ( predicate: PappArg<PLam<PElemsT, PBool>> ): TermBool => psome( elemsT ).$( predicate as any ).$( list )
    );
    
    return list as any;
}

