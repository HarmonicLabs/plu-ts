import { defineReadOnlyProperty, hasOwn, isObject } from "@harmoniclabs/obj-utils";
import { getElemsT } from "./tyArgs";
import { Term, PLam, PType } from "../pluts";

export enum PrimType {
    Int  = "int",
    BS   = "bs",
    Str  = "str",
    Unit = "unit",
    Bool = "bool",
    Data = "data",
    List = "list",
    Pair = "pair",
    Delayed = "delayed",
    Lambda = "lam",
    Struct = "struct",
    Alias = "alias",
    AsData = "asData",
    Sop = "sop",
    bls12_381_G1_element = "bls12_381_G1_element",
    bls12_381_G2_element = "bls12_381_G2_element",
    bls12_381_MlResult = "bls12_381_MlResult",
}

Object.freeze( PrimType );

/**
 * subset of primitive types that do not require additional arguments
 * 
 * a.k.a.
 * `[ BasePrimType ]` is a well formed `TermType`
 */
export type BasePrimType
    = PrimType.Int
    | PrimType.BS
    | PrimType.bls12_381_G1_element
    | PrimType.bls12_381_G2_element
    | PrimType.bls12_381_MlResult
    | PrimType.Str
    | PrimType.Unit
    | PrimType.Bool
    | PrimType.Data;

type NonStructTag
    // | PrimType.Struct
    // | PrimType.Sop
    // | PrimType.Alias
    = PrimType.Int
    | PrimType.BS
    | PrimType.bls12_381_G1_element
    | PrimType.bls12_381_G2_element
    | PrimType.bls12_381_MlResult
    | PrimType.Str
    | PrimType.Unit
    | PrimType.Bool
    | PrimType.Data
    | PrimType.List
    | PrimType.Pair
    | PrimType.Delayed
    | PrimType.Lambda
    | PrimType.AsData;

/*
//this is better but the typescript folks decided to hard code a silly limit in tsc and not include any lazy evaluation option
export type TermType
    = readonly [ BaseT ]
    | readonly [ PrimType.Struct, StructDefinition, Methods ]
    | readonly [ PrimType.Sop, StructDefinition, Methods ]
    | readonly [ PrimType.List, TermType ]
    | readonly [ PrimType.Delayed, TermType ]
    | readonly [ PrimType.Pair , TermType, TermType ]
    | readonly [ PrimType.Lambda , TermType, TermType ]
    | readonly [ PrimType.Alias, TermType, Methods ]
    | readonly [ PrimType.AsData, TermType ]
//*/
export type TermType
    = (
        [ NonStructTag, ...TermType[] ]
        | [ PrimType.Struct, StructDefinition, Methods ]
        | [ PrimType.Sop, SopDefinition, Methods ]
        | [ PrimType.Alias, TermType, Methods ]
    )

export type GenericTermType
    = TermType
    | [ TyParam ]
    | [ NonStructTag, ...GenericTermType[] ]
    | [ PrimType.Struct, GenericStructDefinition, Methods ]
    | [ PrimType.Sop, SopDefinition, Methods ]
    | [ PrimType.Alias, GenericTermType, Methods ]
    // | [ PrimType.List, GenericTermType ]
    // | [ PrimType.Delayed, GenericTermType ]
    // | [ PrimType.Pair , GenericTermType, GenericTermType ]
    // | [ PrimType.Lambda , GenericTermType, GenericTermType ]
    // | [ PrimType.AsData, GenericTermType ]

export type BaseDataRepPrimType
    = PrimType.Int
    | PrimType.BS
    | PrimType.Str
    | PrimType.Unit
    | PrimType.Bool
    | PrimType.Data

export type DataRepPrimType
    // | PrimType.Struct
    // | PrimType.Sop
    // | PrimType.Alias
    // | PrimType.Pair
    // | PrimType.Lambda
    // | PrimType.Delayed
    // | PrimType.bls12_381_G1_element
    // | PrimType.bls12_381_G2_element
    // | PrimType.bls12_381_MlResult
    = BaseDataRepPrimType
    | PrimType.List
    | PrimType.AsData;

/**
 * subset if term types that can be represented with data
 */
export type DataRepTermType
    = [ DataRepPrimType, ...DataRepTermType[] ]
    | [ PrimType.Struct, StructDefinition, Methods ]
    // sop are valid only if it has a struct definitin 
    // not a SopDefiniton
    | [ PrimType.Sop, StructDefinition, Methods ]
    | [ PrimType.Alias, DataRepTermType, Methods ];


export type Methods = { [method: string]: Term<PLam<PType,PType>> }

export type ListT<T extends GenericTermType> = [ PrimType.List, T ];

export type DelayedT<T extends GenericTermType> = [ PrimType.Delayed, T ];

export type PairT<FstT extends GenericTermType, SndT extends GenericTermType> = [ PrimType.Pair , FstT, SndT ];

export type StructT<SDef extends GenericStructDefinition, SMethods extends Methods = {}> = [ PrimType.Struct, SDef, SMethods ];

export type SopT<SDef extends SopDefinition, SMethods extends Methods = {}> = [ PrimType.Sop, SDef, SMethods ];

export type AliasT<T extends GenericTermType, AMethods extends Methods = {}> = T[0] extends PrimType.Alias ? T : [ PrimType.Alias, T, AMethods ];

export type AsDataT<T extends GenericTermType> = T[0] extends PrimType.AsData ? T : [ PrimType.AsData, T ];

export type LamT<InT extends GenericTermType, OutT extends GenericTermType> =  [ PrimType.Lambda, InT, OutT ];
export type FnT<Ins extends [ GenericTermType, ...GenericTermType[] ], OutT extends GenericTermType> =
    Ins extends [] ? OutT :
    Ins extends [ infer In extends GenericTermType ] ? LamT<In, OutT> :
    Ins extends [ infer In extends GenericTermType, ...infer RestIns extends [ GenericTermType, ...GenericTermType[] ] ] ? LamT<In, FnT< RestIns, OutT >> :
    GenericTermType;


export interface ITermTyped<T extends TermType = TermType> {
    type: T
}

export type ExtendedTermType = TermType | ITermTyped;

type NormalizeTermType<ET extends ExtendedTermType> = ET extends ITermTyped<infer T> ? T : ET;

export function normalizeTermType<ET extends ExtendedTermType>( extended: ET ): NormalizeTermType<ET>
{
    if(
        typeof extended === "object" &&
        extended !== null &&
        !Array.isArray( extended ) &&
        hasOwn( extended, "type" )
    ) return extended.type;

    return extended as NormalizeTermType<ET>;
}

export type NonAliasTermType
    = [ NonStructTag, ...TermType[] ]
    | [ PrimType.Struct, StructDefinition, Methods ]
    | [ PrimType.Sop, StructDefinition, Methods ]

export type StructCtorDef = {
    [field: string | number]: TermType
}

export type StructDefinition = {
    [constructor: string]: StructCtorDef
}

export type GenericStructCtorDef = {
    [field: string | number]: GenericTermType
}

export type GenericStructDefinition = {
    [constructor: string]: GenericStructCtorDef
}

export type SopCtorDef = {
    [field: string | number]: TermType
}

export type SopDefinition = {
    [constructor: string]: SopCtorDef
}

export function cloneSopCtorDef<CtorDef extends SopCtorDef>( ctorDef: Readonly<CtorDef> ): CtorDef
{
    const clone: CtorDef = {} as any;

    for( const fieldName in ctorDef )
    {
        clone[ fieldName ] = ctorDef[ fieldName ];
    }

    return clone;
}

export function cloneSopDef<SDef extends SopDefinition>( def: Readonly<SDef> ): SDef
{
    const clone: SDef = {} as SDef;
    const ctors = Object.keys( def );

    for(let i = 0; i < ctors.length; i++ )
    {
        defineReadOnlyProperty(
            clone,
            ctors[ i ],
            cloneSopCtorDef( def[ ctors[i] ] )
        );
    }

    return clone;
}

export const int        = Object.freeze([ PrimType.Int  ]) as [ PrimType.Int  ];
export const bs         = Object.freeze([ PrimType.BS   ]) as [ PrimType.BS   ];
export const blsG1      = Object.freeze([ PrimType.bls12_381_G1_element ]) as [ PrimType.bls12_381_G1_element ];
export const blsG2      = Object.freeze([ PrimType.bls12_381_G2_element ]) as [ PrimType.bls12_381_G2_element ];
export const blsResult  = Object.freeze([ PrimType.bls12_381_MlResult   ]) as [ PrimType.bls12_381_MlResult   ];
export const str        = Object.freeze([ PrimType.Str  ]) as [ PrimType.Str  ];
export const unit       = Object.freeze([ PrimType.Unit ]) as [ PrimType.Unit ];
export const bool       = Object.freeze([ PrimType.Bool ]) as [ PrimType.Bool ];
export const data       = Object.freeze([ PrimType.Data ]) as [ PrimType.Data ];

export const list       = 
    <T extends GenericTermType>( ofElem: T ): [ PrimType.List, T ] => 
        Object.freeze([ PrimType.List, ofElem ]) as any;

export const pair       = 
    <FstT extends GenericTermType, SndT extends GenericTermType>
    ( fst: FstT, snd: SndT ): [ PrimType.Pair, FstT, SndT ] => 
        // all pairs must be "asData"; breaks uplc otherwhise
        Object.freeze([ PrimType.Pair, asData( fst ), asData( snd ) ]) as any ;

export const _pair      = 
    <FstT extends GenericTermType, SndT extends GenericTermType>
        ( fst: FstT, snd: SndT ): [ PrimType.Pair, FstT, SndT ] => 
            // all pairs must be "asData"; breaks uplc otherwhise
            Object.freeze([ PrimType.Pair, fst, snd ]) as any ;

export const map        = 
    <FstT extends GenericTermType, SndT extends GenericTermType>
    ( fst: FstT, snd: SndT ): [ PrimType.List, [ PrimType.Pair, FstT, SndT ] ] => 
        list( pair( fst, snd ) ) as any ;
            
export const lam        = 
    <InT extends GenericTermType, OutT extends GenericTermType>
    ( input: InT, output: OutT ): LamT< InT, OutT > =>
        Object.freeze([ PrimType.Lambda, input, output ]) as any;

function assert( condition: boolean, message: string ): void
{
    if( !condition ) throw new Error( message );
}

export const fn         =
    <InsTs extends [ GenericTermType, ...GenericTermType[] ], OutT extends GenericTermType>( inputs: InsTs , output: OutT ): FnT<InsTs, OutT> => {
        assert(
            inputs.length > 0,
            "unsupported '(void) => any' type at Pluts level"
        );

        if( inputs.length === 1 ) return Object.freeze( lam( inputs[0], output ) ) as any;

        return Object.freeze( lam( inputs[ 0 ], fn( inputs.slice( 1 ) as any, output ) as any ) ) as any;
    }

export const delayed    = 
    <T extends GenericTermType>( toDelay: T ): [ PrimType.Delayed, T ] => 
        Object.freeze([ PrimType.Delayed, toDelay ]) as any;

export const struct     = <SDef extends GenericStructDefinition, SMethods extends Methods>( def: SDef, methods?: SMethods ): StructT<SDef, SMethods> =>
        Object.freeze([ 
            PrimType.Struct,
            Object.freeze( cloneSopDef( def as any ) ),
            Object.freeze( methods ?? {} )
        ]) as any;

export const sop     = <SDef extends SopDefinition, SMethods extends Methods>( def: SDef, methods?: SMethods ): SopT<SDef, SMethods> =>
        Object.freeze([ 
            PrimType.Sop,
            Object.freeze( cloneSopDef( def ) ),
            Object.freeze( methods ?? {} )
        ]) as any;

export function alias<T extends AliasT<TermType>>( toAlias: T ): T
export function alias<T extends GenericTermType, AMethods extends Methods>( toAlias: T ): [ PrimType.Alias, T, {} ]
export function alias<T extends GenericTermType, AMethods extends Methods>( toAlias: T, methods: AMethods ): [ PrimType.Alias, T, AMethods ]
export function alias<T extends GenericTermType, AMethods extends Methods>( toAlias: T, methods?: AMethods ): [ PrimType.Alias, T, AMethods ]
{
    if( toAlias[0] === PrimType.Alias ) return toAlias as any;

    return Object.freeze([ PrimType.Alias, toAlias, Object.freeze( methods ?? {} ) ]) as any;
} 

export function asData( someT: [PrimType.Data] ): [ PrimType.Data ]
export function asData<T extends StructT<StructDefinition>>( someT: T ): T
export function asData<T extends GenericTermType>( someT: T ): [ PrimType.AsData, T ]
export function asData<T extends GenericTermType>( someT: T ): [ PrimType.AsData, T ] | T 
{
    // invalid asData type but not worth to rise an error
    if(
        someT[0] === PrimType.Lambda ||
        someT[0] === PrimType.Delayed
    ) return someT;

    // invalid asData type that need an error
    if(
        someT[0] === PrimType.Sop
    ) throw new Error("'SoP' type can not have an implicit data representation.");

    // already data
    if(
        someT[0] === PrimType.Struct ||
        someT[0] === PrimType.Data   ||
        someT[0] === PrimType.AsData
    ) return someT;

    // map `asData` down if the type is structured

    // if the type is an alias temporarely unwrap;
    // this to prevent blocking the mapping of `asData`
    let exAliasMethods: Methods | undefined = undefined;
    if( someT[0] === PrimType.Alias )
    {
        exAliasMethods = someT[2];
        someT = someT[1] as any;
    }

    // here mapping
    if( someT[0] === PrimType.List )
    {
        const elemsT = getElemsT( someT );
        if( elemsT[0] === PrimType.Pair )
        {
            someT = list( pair( asData( elemsT[1] as any ), asData( elemsT[2] as any ) ) ) as any;
        }
        else if(
            elemsT[0] === PrimType.Alias &&
            elemsT[1][0] === PrimType.Pair
        )
        {
            someT = list( pair( asData( elemsT[1][1] ), asData( elemsT[1][2] ) ) ) as any;
            someT = alias( someT, elemsT[2] ) as any;
        }
        else
        {
            someT = list( asData( elemsT ) ) as any
        }
    }

    // re-wrap in alias if it was infact an alias
    // before finally wrapping everything in `asData`
    if( typeof exAliasMethods !== "undefined" ) someT = alias( someT, exAliasMethods ) as any;

    return Object.freeze([ PrimType.AsData, someT ]) as any;
}

export type TermTypeParameter = symbol;
export type TyParam = TermTypeParameter;

export const tyVar      = ( ( description?: any ) => Object.freeze([ Symbol( description ) ]) ) as (description?: any) => [ TyParam ]