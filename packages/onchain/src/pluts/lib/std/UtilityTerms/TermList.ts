import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { PType } from "../../../PType";
import { PDataRepresentable } from "../../../PType/PDataRepresentable";
import type { PList, TermFn, PInt, PLam, PBool } from "../../../PTypes";
import { Term } from "../../../Term";
import { ToPType, TermType, isWellFormedGenericType, PrimType, bool, lam, list, struct, typeExtends, tyVar } from "../../../type_system";
import { getElemsT } from "../../../type_system/tyArgs";
import { termTypeToString } from "../../../type_system/utils";
import { UtilityTermOf } from "./addUtilityForType";
import { phead, ptail } from "../../builtins/list";
import { pprepend } from "../../builtins/pprepend";
import { PappArg, pappArgToTerm } from "../../pappArg";
import { phoist } from "../../phoist";
import { plet } from "../../plet";
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

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function addPListMethods<PElemsT extends PType>( _lst: Term<PList<PElemsT>> ) : TermList<PElemsT>
{
    const elemsT = getElemsT( _lst.type );

    const lst = new Term(
        list( elemsT ),
        // needs to be wrapped to prevent the garbage collector to collect garbage (lst)
        dbn => _lst.toIR( dbn ),
        (_lst as any).isConstant
    ) as any;

    if(!isWellFormedGenericType( elemsT as any ))
    {
        throw new Error(
            "`addPListMethods` can only be used on lists with concrete types; the type of the lst was: " + termTypeToString( lst.type )
        );
    }

    _definePListMethods( lst, elemsT );
    _definePListMethods( _lst, elemsT );
    
    return lst as any;
}

function _definePListMethods<PElemsT extends PType>( lst: Term<PList<PElemsT>>, elemsT: TermType ): void
{
    definePropertyIfNotPresent(
        lst,
        "head",
        {
            get: () => {
                return plet( phead( elemsT ).$( lst ) )
            },
            ...getterOnly
        }
    );
    definePropertyIfNotPresent(
        lst,
        "tail",
        {
            get: () => plet( ptail( elemsT ).$( lst ) ),
            ...getterOnly
        }
    );
    definePropertyIfNotPresent(
        lst,
        "length",
        {
            get: () => plet( plength( elemsT ).$( lst ) ),
            ...getterOnly
        }
    );
    definePropertyIfNotPresent(
        lst,
        "reversed",
        {
            get: () => plet( preverse( elemsT ).$( lst ) ),
            ...getterOnly
        }
    );


    definePropertyIfNotPresent(
        lst,
        "atTerm",
        {
            get: () => pindexList( elemsT ).$( lst ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        lst,
        "at",
        ( index: PappArg<PInt> ): UtilityTermOf<PElemsT> => pindexList( elemsT ).$( lst ).$( index ) as any
    );

    definePropertyIfNotPresent(
        lst,
        "findTerm",
        {
            get: () => flippedFind( elemsT ).$( lst ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        lst,
        "find",
        ( predicate: PappArg<PLam<PElemsT,PBool>> ): Term<PMaybeT<PElemsT>> => 
            pfind( elemsT ).$( predicate ).$( lst ) as any
    );

    definePropertyIfNotPresent(
        lst,
        "filterTerm",
        {
            get: () => flippedFilter( elemsT ).$( lst ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        lst,
        "filter",
        ( predicate: PappArg<PLam<PElemsT,PBool>> ): TermList<PElemsT> =>
            pfilter( elemsT ).$( predicate as any ).$( lst ) as any
    );

    definePropertyIfNotPresent(
        lst,
        "prependTerm",
        {
            get: () => flippedPrepend( elemsT ).$( lst ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        lst,
        "prepend",
        ( elem: PappArg<PElemsT> ): TermList<PElemsT> => pprepend( elemsT ).$( elem ).$( lst ) as any
    );

    defineReadOnlyProperty(
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
    defineReadOnlyProperty(
        lst,
        "map",
        <PReturnElemT extends PType>( f: PappArg<PLam<PElemsT,PReturnElemT>> ) => {

            f = pappArgToTerm( f as any, lam( elemsT, tyVar() ) ) as Term<PLam<PElemsT,PReturnElemT>>;
            
            const predicateTy = f.type;

            if(!(
                predicateTy[0] === PrimType.Lambda &&
                isWellFormedGenericType( predicateTy[2] )
            ))
            throw new Error(
                `can't map plu-ts fuction of type "${predicateTy}" over a lst of type "lst(${termTypeToString(elemsT)})"`
            );

            return pmap( elemsT, predicateTy[2] ).$( f as any ).$( lst );
        }
    );

    definePropertyIfNotPresent(
        lst,
        "everyTerm",
        {
            get: () => flippedEvery( elemsT )
            .$( lst ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        lst,
        "every",
        ( predicate: PappArg<PLam<PElemsT, PBool>> ): TermBool => pevery( elemsT ).$( predicate as any ).$( lst )
    );

    definePropertyIfNotPresent(
        lst,
        "someTerm",
        {
            get: () => flippedSome( elemsT )
            .$( lst ),
            ...getterOnly
        }
        
    );
    defineReadOnlyProperty(
        lst,
        "some",
        ( predicate: PappArg<PLam<PElemsT, PBool>> ): TermBool => psome( elemsT ).$( predicate as any ).$( lst )
    );
}

