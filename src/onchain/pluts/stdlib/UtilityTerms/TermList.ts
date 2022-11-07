
import ObjectUtils from "../../../../utils/ObjectUtils";
import PType, { PDataRepresentable } from "../../PType"
import PBool from "../../PTypes/PBool";
import PLam, { TermFn } from "../../PTypes/PFn/PLam";
import PInt from "../../PTypes/PInt";
import PList from "../../PTypes/PList"
import { phoist } from "../../Syntax/syntax";
import Term from "../../Term";
import { ConstantableTermType, TermType, ToPType } from "../../Term/Type/base";
import { phead, pprepend, ptail } from "../Builtins";
import { pevery, pfilter, pindexList, pmap, psome } from "../List/methods";
import { pflip } from "../PCombinators";
import { PMaybeT } from "../PMaybe/PMaybe";
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
    readonly at: TermFn<[PInt], PElemsT>
    readonly find: TermFn<[PLam<PElemsT,PBool>], PMaybeT<PElemsT>>
    // readonly includes: TermFn<[PElemsT], PBool>
    // readonly findIndex: TermFn<[PLam<PElemsT,PBool>], PInt>
    readonly filter: TermFn<[PLam<PElemsT,PBool>], PList<PElemsT>>

    // list creation
    readonly preprend: TermFn<[PElemsT], PList<PElemsT>>
    // readonly concat: TermFn<[PList<PElemsT>], PList<PElemsT>>
    
    // transform
    readonly map: <ResultT extends ConstantableTermType>( resultT: ResultT ) => TermFn<[PLam<PElemsT, ToPType<ResultT>>], ToPType<ResultT>>
    // readonly reduce: <ResultT extends ConstantableTermType>( resultT: ResultT ) => TermFn<[PLam<ToPType<ResultT>, PLam<PList<PElemsT>, ToPType<ResultT>>>], ToPType<ResultT>> 

    // predicates
    readonly every: TermFn<[PLam<PElemsT, PBool>], PBool>
    // readonly some:  TermFn<[PLam<PElemsT, PBool>], PBool>
};

export default TermList;

const flippedPrepend = ( elemsT: TermType ) => phoist( pflip.$( pprepend( elemsT ) ) )

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
    )
    ObjectUtils.definePropertyIfNotPresent(
        list,
        "tail",
        {
            get: () => ptail( elemsT ).$( list ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    )

    ObjectUtils.defineReadOnlyProperty(
        list,
        "at",
        pindexList( elemsT ).$( list )
    )

    ObjectUtils.defineReadOnlyProperty(
        list,
        "find",
        pindexList( elemsT ).$( list )
    )

    ObjectUtils.defineReadOnlyProperty(
        list,
        "filter",
        phoist( pflip.$( pfilter( elemsT ) ) ).$( list )
    )

    ObjectUtils.defineReadOnlyProperty(
        list,
        "prepend",
        flippedPrepend( elemsT ).$( list )
    )

    ObjectUtils.defineReadOnlyProperty(
        list,
        "map",
        ( toType: ConstantableTermType ) => 
            phoist( pflip.$( pmap( elemsT, toType ) ) )
            .$( list )
    )

    ObjectUtils.defineReadOnlyProperty(
        list,
        "every",
        phoist( pflip.$( pevery( elemsT ) ) )
        .$( list )
    )
    ObjectUtils.defineReadOnlyProperty(
        list,
        "some",
        phoist( pflip.$( psome( elemsT ) ) )
        .$( list )
    );
    
    return list as any;
}

