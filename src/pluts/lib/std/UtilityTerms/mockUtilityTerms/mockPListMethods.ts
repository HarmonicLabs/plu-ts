import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { PType } from "../../../../PType";
import type { PList, TermFn, PInt, PLam, PBool } from "../../../../PTypes";
import { Term } from "../../../../Term";
import { ToPType, TermType, isWellFormedGenericType, PrimType, bool, lam, list, struct, typeExtends, tyVar, int, pair } from "../../../../../type_system";
import { getElemsT, getFstT, getSndT, unwrapAsData } from "../../../../../type_system/tyArgs";
import { termTypeToString } from "../../../../../type_system/utils";
import { UtilityTermOf } from "../addUtilityForType";
import { PMaybe, type PMaybeT } from "../../PMaybe/PMaybe";
import { TermBool } from "../TermBool";
import { TermList, fixedLengthIter } from "../TermList";
import { makeMockUtilityTerm } from "./makeMockUtilityTerm";
import { makeMockTermInt } from "./mockPIntMethods";
import { makeMockTermBool } from "./mockPBoolMethods";
import { addBaseUtilityTerm } from "../BaseUtilityTerm";

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
        (cfg, dbn) => lst.toIR( cfg, dbn ),
        (lst as any).isConstant
    ) as any;

    if(!isWellFormedGenericType( elemsT as any ))
    {
        throw new Error(
            "`addPListMethods` can only be used on lists with concrete types; the type of the _lst was: " + termTypeToString( _lst.type )
        );
    }

    _mockPListMethods( lst );
    _mockPListMethods( _lst );

    return _lst;
}

function _mockPListMethods<PElemsT extends PType>( _lst: Term<PList<PElemsT>> )
    : TermList<PElemsT>
{
    _lst = addBaseUtilityTerm( _lst );

    const elemsT = getElemsT( _lst.type );

    defineReadOnlyProperty(
        _lst,
        "fixedLengthIterable",
        // as type conversion is fine because this is a funciton
        // and will only always be accessed after this function has
        // defined the necessary methods for "TermList" to be satisfied
        ( max: number ) => fixedLengthIter( _lst as TermList<PElemsT>, max )
    );

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
            get: () => makeMockTermInt(),
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
        "pat",
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
        "pfind",
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
        "pfilter",
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
        "pprepend",
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
        "pmap",
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
        "pevery",
        {
            get: () => makeMockUtilityTerm( lam( lam( elemsT, bool ), bool ) ),
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
        "psome",
        {
            get: () => makeMockUtilityTerm( lam( lam( elemsT, bool ), bool ) ),
            ...getterOnly
        }
        
    );
    defineReadOnlyProperty(
        _lst,
        "some",
        ( predicate: Term<PLam<PElemsT, PBool>> ): TermBool => makeMockTermBool()
    );


    definePropertyIfNotPresent(
        _lst,
        "pincludes",
        {
            get: () => makeMockUtilityTerm( lam( elemsT, bool ) ),
            ...getterOnly
        }
        
    );
    defineReadOnlyProperty(
        _lst,
        "includes",
        ( elem: any ): TermBool => makeMockTermBool()
    );

    definePropertyIfNotPresent(
        _lst,
        "peq",
        {
            get: () => makeMockUtilityTerm( lam( list( elemsT ), bool ) ),
            ...getterOnly
        }
        
    );
    defineReadOnlyProperty(
        _lst,
        "eq",
        ( other: any ): TermBool => makeMockTermBool()
    );

    if( typeExtends( elemsT, pair( tyVar(), tyVar() ) ) )
    {

        const kT = unwrapAsData( getFstT( elemsT ) );
        const vT = unwrapAsData( getSndT( elemsT ) );

        const PMaybeVal = PMaybe( vT );

        definePropertyIfNotPresent(
            _lst,
            "plookup",
            {
                get: () => makeMockUtilityTerm( lam( kT, PMaybeVal.type ) ),
                ...getterOnly
            }
            
        );
        defineReadOnlyProperty(
            _lst,
            "lookup",
            ( key: any ) => makeMockUtilityTerm( PMaybeVal.type )
        );
    }
    
    return _lst as any;
}

