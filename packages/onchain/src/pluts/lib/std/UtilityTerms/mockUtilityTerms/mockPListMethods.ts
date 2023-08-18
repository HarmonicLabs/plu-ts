import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { PType } from "../../../../PType";
import type { PList, TermFn, PInt, PLam, PBool } from "../../../../PTypes";
import { Term } from "../../../../Term";
import { ToPType, TermType, isWellFormedGenericType, PrimType, bool, lam, list, struct, typeExtends, tyVar, int } from "../../../../type_system";
import { getElemsT } from "../../../../type_system/tyArgs";
import { termTypeToString } from "../../../../type_system/utils";
import { UtilityTermOf } from "../addUtilityForType";
import { PMaybe, type PMaybeT } from "../../PMaybe/PMaybe";
import { TermBool } from "../TermBool";
import { TermList } from "../TermList";
import { makeMockUtilityTerm } from "./makeMockUtilityTerm";
import { makeMockTermInt } from "./mockPIntMethods";
import { makeMockTermBool } from "./mockPBoolMethods";

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function mockPListMethods<PElemsT extends PType>( lst: Term<PList<PElemsT>> )
    : TermList<PElemsT>
{
    const elemsT = getElemsT( lst.type );
    const _lst = new Term(
        list( elemsT ),
        // needs to be wrapped to prevent the garbage collector to collect garbage (lst)
        dbn => lst.toIR( dbn ),
        (lst as any).isConstant
    ) as any;

    if(!isWellFormedGenericType( elemsT as any ))
    {
        throw new Error(
            "`addPListMethods` can only be used on lists with concrete types; the type of the _lst was: " + termTypeToString( _lst.type )
        );
    }

    definePropertyIfNotPresent(
        _lst,
        "head",
        {
            get: () => makeMockUtilityTerm( elemsT ),
            ...getterOnly
        }
    );
    definePropertyIfNotPresent(
        _lst,
        "tail",
        {
            get: () => makeMockUtilityTerm( list( elemsT ) ),
            ...getterOnly
        }
    );
    definePropertyIfNotPresent(
        _lst,
        "length",
        {
            get: () => makeMockTermInt,
            ...getterOnly
        }
    );
    definePropertyIfNotPresent(
        _lst,
        "reversed",
        {
            get: () => makeMockUtilityTerm( list( elemsT ) ),
            ...getterOnly
        }
    );


    definePropertyIfNotPresent(
        _lst,
        "atTerm",
        {
            get: () => makeMockUtilityTerm( lam( int, elemsT ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        _lst,
        "at",
        ( index: Term<PInt> ): UtilityTermOf<PElemsT> => makeMockUtilityTerm( elemsT ) as any
    );

    definePropertyIfNotPresent(
        _lst,
        "findTerm",
        {
            get: () => makeMockUtilityTerm( lam( lam( elemsT, bool ), PMaybe( elemsT ).type ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        _lst,
        "find",
        ( predicate: Term<PLam<PElemsT,PBool>> ): Term<PMaybeT<PElemsT>> => makeMockUtilityTerm( PMaybe( elemsT ).type ) as any
    );

    definePropertyIfNotPresent(
        _lst,
        "filterTerm",
        {
            get: () => makeMockUtilityTerm( lam( lam( elemsT, bool ), list( elemsT ) ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        _lst,
        "filter",
        ( predicate: Term<PLam<PElemsT,PBool>> ): TermList<PElemsT> => makeMockUtilityTerm( list( elemsT ) ) as any
    );

    definePropertyIfNotPresent(
        _lst,
        "prependTerm",
        {
            get: () => makeMockUtilityTerm( lam( elemsT, list( elemsT ) ) ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        _lst,
        "prepend",
        ( elem: Term<PElemsT> ): TermList<PElemsT> => makeMockUtilityTerm( list( elemsT ) ) as any
    );

    defineReadOnlyProperty(
        _lst,
        "mapTerm",
        ( toType: TermType ) => makeMockUtilityTerm( lam( lam( elemsT, toType ), list( toType ) ) )
    );
    defineReadOnlyProperty(
        _lst,
        "map",
        <PReturnElemT extends PType>( f: Term<PLam<PElemsT,PReturnElemT>> ) => {

            const predicateTy = f.type;
            
            if(!(
                predicateTy[0] === PrimType.Lambda &&
                isWellFormedGenericType( predicateTy[2] )
            ))
            throw new Error(
                `can't map plu-ts fuction of type "${predicateTy}" over a _lst of type "_lst(${termTypeToString(elemsT)})"`
            );

            return makeMockUtilityTerm( list( predicateTy[2] ) );
        }
    );

    definePropertyIfNotPresent(
        _lst,
        "everyTerm",
        {
            get: () => makeMockUtilityTerm( lam( lam( elemsT, bool ), bool ) )
            .$( _lst ),
            ...getterOnly
        }
    );
    defineReadOnlyProperty(
        _lst,
        "every",
        ( predicate: Term<PLam<PElemsT, PBool>> ): TermBool => makeMockTermBool()
    );

    definePropertyIfNotPresent(
        _lst,
        "someTerm",
        {
            get: () => makeMockUtilityTerm( lam( lam( elemsT, bool ), bool ) )
            .$( _lst ),
            ...getterOnly
        }
        
    );
    defineReadOnlyProperty(
        _lst,
        "some",
        ( predicate: Term<PLam<PElemsT, PBool>> ): TermBool => makeMockTermBool()
    );
    
    return _lst as any;
}

