import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

export const enum PrimType {
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
    AsData = "asData"
}

type BaseT
    = PrimType.Int
    | PrimType.BS
    | PrimType.Str
    | PrimType.Unit
    | PrimType.Bool
    | PrimType.Data

export type ListT<T extends GenericTermType> = [ PrimType.List, T ];

export type DelayedT<T extends GenericTermType> = [ PrimType.Delayed, T ];

export type PairT<FstT extends GenericTermType, SndT extends GenericTermType> = [ PrimType.Pair , FstT, SndT ];

export type StructT<GSDef extends GenericStructDefinition> = [ PrimType.Struct, GSDef ];

export type AliasT<T extends GenericTermType> = T[0] extends PrimType.Alias ? T : [ PrimType.Alias, T ];

export type AsDataT<T extends GenericTermType> = T[0] extends PrimType.AsData ? T : [ PrimType.AsData, T ];

export type LamT<InT extends GenericTermType, OutT extends GenericTermType> =  [ PrimType.Lambda, InT, OutT ];
export type FnT<Ins extends [ GenericTermType, ...GenericTermType[] ], OutT extends GenericTermType> =
    Ins extends [] ? OutT :
    Ins extends [ infer In extends GenericTermType ] ? LamT<In, OutT> :
    Ins extends [ infer In extends GenericTermType, ...infer RestIns extends [ GenericTermType, ...GenericTermType[] ] ] ? LamT<In, FnT< RestIns, OutT >> :
    GenericTermType;


type NonStructTag
    = PrimType.Int
    | PrimType.BS
    | PrimType.Str
    | PrimType.Unit
    | PrimType.Bool
    | PrimType.Data
    | PrimType.List
    | PrimType.Pair
    | PrimType.Delayed
    | PrimType.Lambda
    | PrimType.Alias
    | PrimType.AsData;

/*
//this is better but the typescript folks decided to hard code a silly limit in tsc and not include any lazy evaluation option

export type TermType
    = readonly [ BaseT ]
    | readonly [ PrimType.Struct, StructDefinition ]
    | readonly [ PrimType.List, TermType ]
    | readonly [ PrimType.Delayed, TermType ]
    | readonly [ PrimType.Pair , TermType, TermType ]
    | readonly [ PrimType.Lambda , TermType, TermType ]
    | readonly [ PrimType.Alias, TermType ]
    | readonly [ PrimType.AsData, TermType ]
//*/
//*
export type TermType
    = [ NonStructTag, ...TermType[] ] | [ PrimType.Struct, StructDefinition ]
//*/

export type StructCtorDef = {
    [field: string | number]: TermType
}

export type StructDefinition = {
    [constructor: string]: StructCtorDef
}

export function cloneStructCtorDef<CtorDef extends StructCtorDef>( ctorDef: Readonly<CtorDef> ): CtorDef
{
    const clone: CtorDef = {} as any;

    for( const fieldName in ctorDef )
    {
        clone[ fieldName ] = ctorDef[ fieldName ];
    }

    return clone;
}

export function cloneStructDef<SDef extends StructDefinition>( def: Readonly<SDef> ): SDef
{
    const clone: SDef = {} as SDef;
    const ctors = Object.keys( def );

    for(let i = 0; i < ctors.length; i++ )
    {
        ObjectUtils.defineReadOnlyProperty(
            clone,
            ctors[ i ],
            cloneStructCtorDef( def[ ctors[i] ] )
        );
    }

    return clone;
}

export const int        = Object.freeze([ PrimType.Int  ]) as [ PrimType.Int  ];
export const bs         = Object.freeze([ PrimType.BS   ]) as [ PrimType.BS   ];
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
        Object.freeze([ PrimType.Pair, fst, snd ]) as any ;

export const lam        = 
    <InT extends GenericTermType, OutT extends GenericTermType>
    ( input: InT, output: OutT ): LamT< InT, OutT > =>
        Object.freeze([ PrimType.Lambda, input, output ]) as any;

export const fn         =
    <InsTs extends [ GenericTermType, ...GenericTermType[] ], OutT extends GenericTermType>( inputs: InsTs , output: OutT ): FnT<InsTs, OutT> => {
        JsRuntime.assert(
            inputs.length > 0,
            "unsupported '(void) => any' type at Pluts level"
        );

        if( inputs.length === 1 ) return Object.freeze( lam( inputs[0], output ) ) as any;

        return Object.freeze( lam( inputs[ 0 ], lam( inputs.slice( 1 ) as any, output ) as any ) ) as any;
    }

export const delayed    = 
    <T extends GenericTermType>( toDelay: T ): [ PrimType.Delayed, T ] => 
        Object.freeze([ PrimType.Delayed, toDelay ]) as any;

export const struct     = <GSDef extends GenericStructDefinition>( def: GSDef ): StructT<GSDef> =>
        Object.freeze([ 
            PrimType.Struct,
            Object.freeze( cloneStructDef( def ) )
        ]) as any;

export function alias<T extends AliasT<TermType>>( toAlias: T ): T
export function alias<T extends GenericTermType>( toAlias: T ): [ PrimType.Alias, T ]
export function alias<T extends GenericTermType>( toAlias: T ): [ PrimType.Alias, T ]
{
    if( toAlias[0] === PrimType.Alias ) return toAlias as any;

    return Object.freeze([ PrimType.Alias, toAlias ]) as any;
} 

export function asData( someT: [PrimType.Data] ): [ PrimType.Data ]
export function asData<T extends StructT<GenericStructDefinition>>( someT: T ): T
export function asData<T extends GenericTermType>( someT: T ): [ PrimType.AsData, T ]
export function asData<T extends GenericTermType>( someT: T ): [ PrimType.AsData, T ] | T 
{
    if(
        someT[0] === PrimType.Struct ||
        someT[0] === PrimType.Data   ||
        someT[0] === PrimType.AsData
    ) return someT;

    return Object.freeze([ PrimType.AsData, someT ]) as any;
}

export type TermTypeParameter = symbol;
export type TyParam = TermTypeParameter;

export type GenericStructCtorDef = {
    [field: string | number]: GenericTermType
}
    
export type GenericStructDefinition = {
    [constructor: string]: StructCtorDef
}

export const tyVar      = ( ( description?: any ) => Object.freeze([ Symbol( description ) ]) ) as (description?: any) => [ TyParam ]

export type GenericTermType
= TermType
| [ TyParam ]
| [ PrimType.Struct, GenericStructDefinition ]
| [ PrimType.List, GenericTermType ]
| [ PrimType.Delayed, GenericTermType ]
| [ PrimType.Pair , GenericTermType, GenericTermType ]
| [ PrimType.Lambda , GenericTermType, GenericTermType ]
| [ PrimType.Alias, GenericTermType ]
| [ PrimType.AsData, GenericTermType ]