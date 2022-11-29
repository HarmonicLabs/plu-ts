
import BasePlutsError from "../../../../errors/BasePlutsError";
import ObjectUtils from "../../../../utils/ObjectUtils";
import PType from "../../PType"
import type PDataRepresentable from "../../PType/PDataRepresentable";
import PBool from "../../PTypes/PBool";
import { TermFn } from "../../PTypes/PFn/PFn";
import PLam from "../../PTypes/PFn/PLam";
import PInt from "../../PTypes/PInt";
import PList from "../../PTypes/PList"
import { PappArg } from "../../Syntax/pappArg";
import { phoist } from "../../Syntax/syntax";
import Term from "../../Term";
import { ConstantableTermType, TermType } from "../../Term/Type/base";
import { isConstantableTermType, isLambdaType } from "../../Term/Type/kinds";
import { ToPType } from "../../Term/Type/ts-pluts-conversion";
import { termTypeToString } from "../../Term/Type/utils";
import { phead, pprepend, ptail } from "../Builtins";
import { plength, preverse } from "../List";
import { pevery, pfilter, pfind, pindexList, pmap, psome } from "../List/methods";
import { pflip } from "../PCombinators";
import { PMaybeT } from "../PMaybe/PMaybe";
import { UtilityTermOf } from "./addUtilityForType";
import TermBool from "./TermBool";
import TermInt from "./TermInt";

type TermList<PElemsT extends PDataRepresentable> = Term<PList<PElemsT>> & {

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
    readonly mapTerm: <ResultT extends ConstantableTermType>( resultT: ResultT ) => TermFn<[PLam<PElemsT, ToPType<ResultT>>], PList<ToPType<ResultT>>>
    readonly map:     <PResultElemT extends PType>( f: PappArg<PLam<PElemsT,PResultElemT>> ) => TermList<PResultElemT>
    // readonly reduce: <ResultT extends ConstantableTermType>( resultT: ResultT ) => TermFn<[PLam<ToPType<ResultT>, PLam<PList<PElemsT>, ToPType<ResultT>>>], ToPType<ResultT>> 

    // predicates
    readonly everyTerm: TermFn<[PLam<PElemsT, PBool>], PBool>
    readonly every:     ( predicate: PappArg<PLam<PElemsT, PBool>> ) => TermBool
    
    readonly someTerm:  TermFn<[PLam<PElemsT, PBool>], PBool>
    readonly some:      ( predicate: PappArg<PLam<PElemsT, PBool>> ) => TermBool
};

export default TermList;

function getHoistedFlipped<T extends TermType | ConstantableTermType, PSomething extends PType, PReturnT extends PType >( 
    pfunc: (elemsT: T) => TermFn<[ PSomething, PList<ToPType<T>> ], PReturnT>
): (elemsT: T) => TermFn<[ PList<ToPType<T>>, PSomething ], PReturnT>
{
    return ( elemsT ) => phoist( pflip.$( pfunc( elemsT ) ) ) as any;
}

const flippedPrepend = getHoistedFlipped(
    // @ts-ignore Type instantiation is excessively deep and possibly infinite.
    pprepend
);
const flippedFind = ( t: ConstantableTermType ) => phoist( pflip.$( pfind( t ) ) )
const flippedFilter = getHoistedFlipped( pfilter );
const flippedEvery = getHoistedFlipped( pevery )
const flippedSome = getHoistedFlipped( psome )

export function addPListMethods<PElemsT extends PType>( list: Term<PList<PElemsT>> )
    : TermList<PElemsT>
{
    const elemsT = list.type[1] as ConstantableTermType;
    if(!isConstantableTermType( elemsT as any ))
    {
        throw new BasePlutsError(
            "`addPListMethods` can only be used on lists with concrete types; the type of the list was: " + termTypeToString( list.type )
        );
    }

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

