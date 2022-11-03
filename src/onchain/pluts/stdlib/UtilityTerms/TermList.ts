
import ObjectUtils from "../../../../utils/ObjectUtils";
import PType, { PDataRepresentable } from "../../PType"
import PBool from "../../PTypes/PBool";
import PLam, { TermFn } from "../../PTypes/PFn/PLam";
import PInt from "../../PTypes/PInt";
import PList from "../../PTypes/PList"
import Term from "../../Term";
import { ConstantableTermType, FromPType } from "../../Term/Type";
import { phead, pprepend, ptail } from "../Builtins";
import { pindexList } from "../List";
import { PMaybeT } from "../PMaybe";
import TermBool from "./TermBool";
import TermInt from "./TermInt";
import { TryUtitlityFromPType, TryUtitlityFromTerm, UtitlityFromTerm } from "./types";

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
    at: ( index : Term<PInt> ) =>  TryUtitlityFromPType<PElemsT>
    find: ( predicate: Term<PLam<PElemsT,PBool>> ) => Term<PMaybeT<PElemsT>>
    includes: ( elem: Term<PElemsT> ) => TermBool
    findIndex: ( predicate: Term<PLam<PElemsT,PBool>> ) => TermInt
    filter: ( predicate: Term<PLam<PElemsT,PBool>> ) => TermList<PElemsT>

    // list creation
    preprend: ( elem: Term<PElemsT> ) => TermList<PElemsT>
    concat: ( otherList: Term<PList<PElemsT>> ) => Term<PList<PElemsT>>
    
    // transform
    map: <ResultPType extends PType>( f: Term<PLam<PElemsT, ResultPType>> ) => TermList<ResultPType>
    reduce: <PResultT extends PType>( reduceFunc: Term<PLam<PResultT, PLam<PList<PElemsT>, PResultT>>>, accumulator: Term<PResultT> ) => TryUtitlityFromPType<PResultT>

    // predicates
    every: ( predicate: Term<PLam<PElemsT, PBool>> ) => TermBool
    some:  ( predicate: Term<PLam<PElemsT, PBool>> ) => TermBool
};

export default TermList;

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
            get: () => addPListMethods( ptail( elemsT ).$( list ) ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    )

    ObjectUtils.defineReadOnlyProperty(
        list,
        "at",
        ( index : Term<PInt> ): TryUtitlityFromPType<PElemsT> => {
            return pindexList( elemsT ).$( list ).$( index ) as TryUtitlityFromPType<PElemsT>
        }
    )

    ObjectUtils.defineReadOnlyProperty(
        list,
        "prepend",
        ( elem: Term<PElemsT> ): TermList<PElemsT> => {
            return addPListMethods<PElemsT>(
                pprepend( elemsT ).$( elem ).$( list ) as any
            );
        }
    )
    
    return list as any;
}

