import { BasePlutsError } from "../../../../../errors/BasePlutsError";
import ObjectUtils from "../../../../../utils/ObjectUtils";
import { PType } from "../../../PType";
import { PDataRepresentable } from "../../../PType/PDataRepresentable";
import type { PList, TermFn, PInt, PLam, PBool } from "../../../PTypes";
import { Term } from "../../../Term";
import { ToPType, TermType, unwrapAlias, isTaggedAsAlias, isWellFormedGenericType, PrimType, bool, lam, list, FromPType, struct } from "../../../type_system";
import { termTypeToString } from "../../../type_system/utils";
import { UtilityTermOf } from "../../addUtilityForType";
import { phead, ptail } from "../../builtins/list";
import { pprepend } from "../../builtins/pprepend";
import { PappArg } from "../../pappArg";
import { phoist } from "../../phoist";
import type { PMaybeT } from "../PMaybe/PMaybe";
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

const flippedPrepend = ( t: TermType ) => phoist(
        pflip( 
            list( t ), 
            t,
            list( t )
        ).$( pprepend( t ) )
    );
const flippedFind = ( t: TermType ) => phoist(
        pflip( 
            list( t ), 
            lam( t, bool ),
            struct({
                Just: { val: t },
                Nothing: {}
            })
        ).$( pfind( t ) as any )
    )
const flippedFilter = ( t: TermType ) => phoist(
    pflip( 
        list( t ), 
        lam( t, bool ),
        list( t )
    ).$( pfilter( t ) )
);
const flippedEvery = ( t: TermType ) => phoist(
        pflip( 
            list( t ), 
            lam( t, bool ),
            bool
        ).$( pevery( t ) )
    );
const flippedSome = ( t: TermType ) => phoist(
        pflip( 
            list( t ), 
            lam( t, bool ),
            bool
        ).$( psome( t ) )
    );

export function addPListMethods<PElemsT extends PType>( lst: Term<PList<PElemsT>> )
    : TermList<PElemsT>
{
    const elemsT = (isTaggedAsAlias( lst.type ) ? unwrapAlias( lst.type )[1] : lst.type[1]) as TermType;
    if(!isWellFormedGenericType( elemsT as any ))
    {
        throw new BasePlutsError(
            "`addPListMethods` can only be used on lists with concrete types; the type of the lst was: " + termTypeToString( lst.type )
        );
    }

    // console.log( "addPMethods; __isListOfDynPairs", (lst as any).__isListOfDynPairs )

    ObjectUtils.definePropertyIfNotPresent(
        lst,
        "head",
        {
            get: () => phead( elemsT ).$( lst ) ,
            set: () => {},
            configurable: false,
            enumerable: true
        }
    );
    ObjectUtils.definePropertyIfNotPresent(
        lst,
        "tail",
        {
            get: () => ptail( elemsT ).$( lst ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    );
    ObjectUtils.definePropertyIfNotPresent(
        lst,
        "length",
        {
            get: () => plength( elemsT ).$( lst ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    );
    ObjectUtils.definePropertyIfNotPresent(
        lst,
        "reversed",
        {
            get: () => preverse( elemsT ).$( lst ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    );


    ObjectUtils.defineReadOnlyProperty(
        lst,
        "atTerm",
        pindexList( elemsT ).$( lst )
    );
    ObjectUtils.defineReadOnlyProperty(
        lst,
        "at",
        ( index: PappArg<PInt> ): UtilityTermOf<PElemsT> => pindexList( elemsT ).$( lst ).$( index ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        lst,
        "findTerm",
        flippedFind( elemsT ).$( lst )
    );
    ObjectUtils.defineReadOnlyProperty(
        lst,
        "find",
        ( predicate: PappArg<PLam<PElemsT,PBool>> ): Term<PMaybeT<PElemsT>> => 
            pfind( elemsT ).$( predicate ).$( lst ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        lst,
        "filterTerm",
        flippedFilter( elemsT ).$( lst )
    );
    ObjectUtils.defineReadOnlyProperty(
        lst,
        "filter",
        ( predicate: PappArg<PLam<PElemsT,PBool>> ): TermList<PElemsT> =>
            pfilter( elemsT ).$( predicate as any ).$( lst ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        lst,
        "prependTerm",
        flippedPrepend( elemsT ).$( lst )
    );
    ObjectUtils.defineReadOnlyProperty(
        lst,
        "prepend",
        ( elem: PappArg<PElemsT> ): TermList<PElemsT> => pprepend( elemsT ).$( elem ).$( lst ) as any
    );

    ObjectUtils.defineReadOnlyProperty(
        lst,
        "mapTerm",
        ( toType: TermType ) => 
            phoist(
                pflip(
                    list( elemsT ),
                    lam( elemsT, toType ),
                    list( toType )
                ).$( pmap( elemsT, toType ) )
            )
            .$( lst )
    );
    ObjectUtils.defineReadOnlyProperty(
        lst,
        "map",
        <PReturnElemT extends PType>( f: Term<PLam<PElemsT,PReturnElemT>> ) => {
            const predicateTy = f.type;
            if(!(
                predicateTy[0] === PrimType.Lambda &&
                isWellFormedGenericType( predicateTy[2] )
            ))
            throw new BasePlutsError(
                `can't map plu-ts fuction of type "${predicateTy}" over a lst of type "lst(${termTypeToString(elemsT)})"`
            );

            return pmap( elemsT, predicateTy[2] ).$( f as any ).$( lst );
        }
    );

    ObjectUtils.defineReadOnlyProperty(
        lst,
        "everyTerm",
        flippedEvery( elemsT )
        .$( lst )
    );
    ObjectUtils.defineReadOnlyProperty(
        lst,
        "every",
        ( predicate: PappArg<PLam<PElemsT, PBool>> ): TermBool => pevery( elemsT ).$( predicate as any ).$( lst )
    );

    ObjectUtils.defineReadOnlyProperty(
        lst,
        "someTerm",
        flippedSome( elemsT )
        .$( lst )
    );
    ObjectUtils.defineReadOnlyProperty(
        lst,
        "some",
        ( predicate: PappArg<PLam<PElemsT, PBool>> ): TermBool => psome( elemsT ).$( predicate as any ).$( lst )
    );
    
    return lst as any;
}

