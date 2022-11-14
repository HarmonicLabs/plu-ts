import Term from "..";
import JsRuntime from "../../../../utils/JsRuntime";
import PType, { PDataRepresentable } from "../../PType";
import { PAlias } from "../../PTypes";
import { AliasDefinition } from "../../PTypes/PAlias/palias";
import PBool from "../../PTypes/PBool";
import PByteString from "../../PTypes/PByteString";
import PData from "../../PTypes/PData/PData";
import PDataBS from "../../PTypes/PData/PDataBS";
import PDataConstr from "../../PTypes/PData/PDataConstr";
import PDataInt from "../../PTypes/PData/PDataInt";
import PDataList from "../../PTypes/PData/PDataList";
import PDataMap from "../../PTypes/PData/PDataMap";
import PDataPair from "../../PTypes/PData/PDataPair";
import PDelayed from "../../PTypes/PDelayed";
import PLam from "../../PTypes/PFn/PLam";
import PInt from "../../PTypes/PInt";
import PList from "../../PTypes/PList";
import PPair from "../../PTypes/PPair";
import PString from "../../PTypes/PString";
import { ConstantableStructDefinition, PStruct, StructCtorDef, StructDefinition } from "../../PTypes/PStruct/pstruct";
import PUnit from "../../PTypes/PUnit";
import { isConstantableTermType } from "./kinds";

export const enum PrimType {
    Int  = "Int",
    BS   = "ByteString",
    Str  = "Str",
    Unit = "Unit",
    Bool = "Bool",
    List = "List",
    Pair = "Pair",
    Delayed = "Delayed",
    Lambda = "Lambda"
}

export const enum DataConstructor {
    Any = "GenericData",
    Constr = "DataConstructor",
    Pair = "DataPair",
    List = "DataList",
    Int = "DataInt",
    BS = "DataByteString",
}

export type TermTypeParameter = symbol;

export const structType = Symbol("structType");
export const anyStruct  = Symbol("anyStruct");

/**
 * type of a struct with all types defined
 */
export type ConstantableStructType  = readonly [ typeof structType, ConstantableStructDefinition ];
export type GenericStructType       = readonly [ typeof structType, StructDefinition | typeof anyStruct ];
export type StructType              = readonly [ typeof structType, StructDefinition | typeof anyStruct ];

export const aliasType = Symbol("aliasType");

export type AliasTermType<AliasId extends symbol, T extends ConstantableTermType> = readonly [ typeof aliasType, AliasDefinition<T,AliasId> ];
export type AnyAlias = AliasTermType<symbol, ConstantableTermType>;

export type TypeName = PrimType | DataConstructor | TermTypeParameter

export type DataType = [ DataConstructor, ...DataType[] ]

export type LambdaType<InT extends TermType, OutT extends TermType> = readonly [ PrimType.Lambda, InT, OutT ];
export type FnType<Ins extends [ TermType, ...TermType[] ], OutT extends TermType> =
    Ins extends [] ? OutT :
    Ins extends [ infer In extends TermType ] ? LambdaType<In, OutT> :
    Ins extends [ infer In extends TermType, ...infer RestIns extends [ TermType, ...TermType[] ] ] ? LambdaType<In, FnType< RestIns, OutT >> :
    TermType;

// needed to avoid circuar dependecies
function cloneStructCtorDef<CtorDef extends StructCtorDef>( ctorDef: Readonly<CtorDef> ): CtorDef
{
    const clone: CtorDef = {} as any;

    for( const fieldName in ctorDef )
    {
        clone[ fieldName ] = ctorDef[ fieldName ];
    }

    return clone;
}

// needed to avoid circuar dependecies
function cloneStructDef<SDef extends StructDefinition>( def: Readonly<SDef> ): SDef
{
    const clone: SDef = {} as SDef;

    for( const ctorName in def )
    {
        clone[ ctorName ] = cloneStructCtorDef( def[ ctorName ] ) as any;
    }

    return clone;
}


//@ts-ignore
const Type: {
    readonly Var:   ( description?: any ) => [ TermTypeParameter ]
    readonly Any:   [ TermTypeParameter ];
    readonly Int:   [ PrimType.Int ];
    readonly BS:    [ PrimType.BS ];
    readonly Str:   [ PrimType.Str ];
    readonly Unit:  [ PrimType.Unit ];
    readonly Bool:  [ PrimType.Bool ];
    readonly List:  <T extends TermType>(ofElem: T) => [ PrimType.List, T ];
    readonly Pair:  <FstT extends TermType, SndT extends TermType>(fst: FstT, snd: SndT) => [ PrimType.Pair, FstT, SndT ] ;
    readonly Map:   <KeyT extends TermType, ValT extends TermType>(k: KeyT, v: ValT) => [PrimType.List, [PrimType.Pair, KeyT, ValT]]
    readonly Delayed: <T extends TermType>(toDelay: T) => [ PrimType.Delayed, T ];
    readonly Lambda: <InT extends TermType, OutT extends TermType>(input: InT, output: OutT) => [ PrimType.Lambda, InT, OutT ];
    readonly Fn: <InsTs extends [ TermType, ...TermType[] ], OutT extends TermType>( inputs: InsTs, output: OutT ) => FnType<InsTs, OutT>
    readonly Struct: ( def: StructDefinition | typeof anyStruct ) => StructType
    readonly Data: {
        readonly Any: [ DataConstructor.Any ];
        readonly Constr: [ DataConstructor.Constr ];
        readonly Map: (keyType: DataType, valueType: DataType) => DataType;
        readonly Pair: (fstType: DataType, sndType: DataType) => DataType;
        readonly List: (elements: DataType) => DataType;
        readonly Int: FixedTermDataType;
        readonly BS: FixedTermDataType;
    }
 } = Object.freeze(
    Object.defineProperty({
    Var:        ( description?: any ) => Object.freeze([ Symbol( description ) ]),
    // Any:        Object.freeze([ PrimType.Any ]),
    Int:        Object.freeze([ PrimType.Int ]),
    BS:         Object.freeze([ PrimType.BS ]),
    Str:        Object.freeze([ PrimType.Str ]),
    Unit:       Object.freeze([ PrimType.Unit ]),
    Bool:       Object.freeze([ PrimType.Bool ]),
    List:       <T extends TermType>( ofElem: T ): readonly [ PrimType.List, T ] => Object.freeze([ PrimType.List, ofElem ]) ,
    Pair:       <FstT extends TermType, SndT extends TermType>( fst: FstT, snd: SndT ): readonly [ PrimType.Pair, FstT, SndT ] => Object.freeze([ PrimType.Pair, fst, snd ]),
    Map:        <KeyT extends TermType, ValT extends TermType>( k: KeyT, v: ValT ) => Type.List( Type.Pair( k, v ) ),
    Delayed:    <T extends TermType>( toDelay: T ): readonly [ PrimType.Delayed, T ] => Object.freeze([ PrimType.Delayed, toDelay ]),
    Lambda:     <InT extends TermType, OutT extends TermType>( input: InT, output: OutT ): LambdaType< InT, OutT > => Object.freeze([ PrimType.Lambda, input, output ]),
    Fn:         <InsTs extends [ TermType, ...TermType[] ], OutT extends TermType>( inputs: InsTs , output: TermType ): FnType<InsTs, OutT> => {
        JsRuntime.assert(
            inputs.length > 0,
            "unsupported '(void) => any' type at Pluts level"
        );

        if( inputs.length === 1 ) return Object.freeze( Type.Lambda( inputs[0], output ) ) as any;

        return Object.freeze( Type.Lambda( inputs[ 0 ], Type.Fn( inputs.slice( 1 ) as [ TermType, ...TermType[] ], output ) ) ) as any;
    },
    Struct:     ( def: StructDefinition | typeof anyStruct ): StructType =>
        Object.freeze([ 
            structType,
            typeof def === "symbol" ?
                def :
                Object.freeze( cloneStructDef( def ) )
        ]),
    Data: Object.freeze({
        Any:    Object.freeze([ DataConstructor.Any ]),
        Constr: Object.freeze([ DataConstructor.Constr as FixedDataTypeName ]),
        Map:    ( keyType: DataType, valueType: DataType ) => Object.freeze( Type.Data.List( Type.Data.Pair( keyType, valueType) ) ),
        Pair:   ( fstType: DataType, sndType: DataType ) => Object.freeze([ DataConstructor.Pair, fstType, sndType ]),
        List:   ( elements: DataType ) => Object.freeze([ DataConstructor.List, elements ]),
        Int:    Object.freeze([ DataConstructor.Int as FixedDataTypeName ]),
        BS:     Object.freeze([ DataConstructor.BS as FixedDataTypeName ])
    })
}, "Any", {configurable: false, enumerable: true, get: () => Type.Var("Type.Any"), set: ( _v?: any ) => {} }));

export default Type;

/**
 * Utility object to get fixed type
 * 
 * > example usage:
 * >
 * >  ```ts
 * >  const { fn, lam, int } = TypeShortcut;
 * >  
 * >  // both equivalent to:    Type.Lambda( Type.Int, Type.Lambda( Type.Int, Type.Int ) );
 * >  const intBinOpType =      lam( int, lam( int, int ) );
 * >  const same =              fn([ int, int ], int);
 * >  ```
 */
export const TypeShortcut = Object.freeze({
    int: Type.Int,
    bs: Type.BS,
    str: Type.Str,
    unit: Type.Unit,
    bool: Type.Bool,
    list: Type.List,
    pair: Type.Pair,
    map: Type.Map,
    struct: Type.Struct,
    delayed: Type.Delayed,
    lam: Type.Lambda,
    fn: Type.Fn,
    data: Type.Data.Any
})

export const int        = Type.Int;
export const bs         = Type.BS;
export const str        = Type.Str;
export const unit       = Type.Unit;
export const bool       = Type.Bool;
export const list       = Type.List;
export const pair       = Type.Pair;
export const map        = Type.Map;
export const lam        = Type.Lambda;
export const fn         = Type.Fn;
export const delayed    = Type.Delayed;
export const tyVar      = Type.Var;
export const struct     = Type.Struct;
export const data       = Type.Data.Any;


// Type = TypeName followed by optional (nested) Types
export type TermType = readonly [ TypeName, ...TermType[] ] | StructType | AnyAlias ;

export type FixedDataTypeName
    = DataConstructor.Constr
    | DataConstructor.List
    | DataConstructor.Pair
    | DataConstructor.Int
    | DataConstructor.BS;

export type FixedTermDataType = [ FixedDataTypeName, ...FixedTermDataType[] ]

export type FixedTypeName
    = PrimType.Int
    | PrimType.BS
    | PrimType.Bool
    | PrimType.Delayed
    | PrimType.Lambda
    | PrimType.List
    | PrimType.Pair
    | PrimType.Str
    | PrimType.Unit;

/**
 * ```TermType``` without ```Any``` or parameters
*/
export type FixedTermType = [ FixedTypeName, ...FixedTermType[] ] | FixedTermDataType

export type ConstantableTypeName
    = PrimType.Int
    | PrimType.BS
    | PrimType.Bool
    | PrimType.List
    | PrimType.Pair
    | PrimType.Str
    | PrimType.Unit
    | DataConstructor;

export type ConstantableTermType
    = [ ConstantableTypeName, ...ConstantableTermType[] ]
    | ConstantableStructType
    | readonly [typeof aliasType, {
        id: symbol;
        type: ConstantableTermType;
    }];

export type ToPDataType<DT extends DataType> =
    DT extends [ DataConstructor.Int ] ? PDataInt :
    DT extends [ DataConstructor.BS  ] ? PDataBS  :
    DT extends [ DataConstructor.List, [ DataConstructor.Pair, infer DataK extends DataType, infer DataV extends DataType] ] ? PDataMap<ToPDataType<DataK>, ToPDataType<DataV>> :
    DT extends [ DataConstructor.List, infer DataElemT extends DataType ] ? PDataList<ToPDataType<DataElemT>> :
    DT extends [ DataConstructor.Pair, infer DataFst extends DataType, infer DataSnd extends DataType ] ? PDataPair<ToPDataType<DataFst>,ToPDataType<DataSnd>> :
    DT extends [ DataConstructor.Constr ] ? PDataConstr :
    DT extends DataType ? PData :
    never;

export type ToPDataTypeArr<DTArr extends DataType[]> =
    DTArr extends [] ? [] & PData[] :
    DTArr extends [ infer DT extends DataType ] ? [ ToPDataType<DT> ] :
    DTArr extends [ infer DT extends DataType, ...infer RestDTs extends DataType[] ] ? [ ToPDataType<DT>, ...ToPDataTypeArr<RestDTs> ] :
    never;

export type FromPDataType<PDT extends PData> =
    PDT extends PDataInt ? [ DataConstructor.Int ] :
    PDT extends PDataBS  ? [ DataConstructor.BS  ] :
    PDT extends PDataMap<infer PDataK extends PData, infer PDataV extends PData> ?
        [ DataConstructor.List, [ DataConstructor.Pair, FromPDataType<PDataK>, FromPDataType<PDataV> ] ] :
    PDT extends PDataList<infer PDataElemT extends PData> ? [ DataConstructor.List, FromPDataType<PDataElemT> ] :
    PDT extends PDataPair<infer PDataFst extends PData, infer PDataSnd extends PData> ?
        [ DataConstructor.Pair, FromPDataType<PDataFst>, FromPDataType<PDataSnd> ]:
    PDT extends PDataConstr ? [ DataConstructor.Constr ] :
    PDT extends PData ? DataType :
    never;

export type FromPDataTypeArr<PDTArr extends PData[]> =
    PDTArr extends [] ? [] & DataType[] :
    PDTArr extends [ infer PDT extends PData ] ? [ FromPDataType<PDT> ] :
    PDTArr extends [ infer PDT extends PData, ...infer RestPDTs extends PData[] ] ? [ FromPDataType<PDT>, ...FromPDataTypeArr<RestPDTs> ] :
    never;

export type ToPType<T extends TermType> =
    T extends [ PrimType.Int ]   ? PInt :
    T extends [ PrimType.BS ]    ? PByteString :
    T extends [ PrimType.Str ]   ? PString :
    T extends [ PrimType.Unit ]  ? PUnit :
    T extends [ PrimType.Bool ]  ? PBool :
    T extends [ PrimType.List, infer ListTyArg extends TermType ]  ? PList< ToPType<ListTyArg> > :
    T extends [ PrimType.Pair, infer FstTyArg extends TermType, infer SndTyArg extends TermType ]  ? PPair< ToPType<FstTyArg>, ToPType<SndTyArg> > :
    T extends [ PrimType.Delayed, infer TyArg extends TermType ]  ? PDelayed< ToPType<TyArg> > :
    T extends [ PrimType.Lambda, infer InputTyArg extends TermType, infer OutputTyArg extends TermType ] ?
        PLam< ToPType<InputTyArg>, ToPType<OutputTyArg> > :
    T extends LambdaType<infer InputTyArg extends TermType, infer OutputTyArg extends TermType> ?
        PLam< ToPType<InputTyArg>, ToPType<OutputTyArg> > :
    T extends [ typeof aliasType, AliasDefinition<infer ActualT extends ConstantableTermType, infer AliasId extends symbol> ] ?
        PAlias<ActualT, AliasId> :
    T extends [ typeof structType, infer SDef extends ( StructDefinition | typeof anyStruct ) ] ?
        ( SDef extends ConstantableStructDefinition ? PStruct<SDef> : PData ):
    T extends [ DataConstructor, ...DataType[] ] ? PData :
    // covers ```TermTypeParameter```s too
    T extends TermType ? PType :
    // T extends FromPType<infer PT extends PType> ? PT : // !!! IMPORTANT !!! can only be present in one of the two types; breaks TypeScript LSP otherwise
    never;

export type FromPType<PT extends PType | ToPType<TermType> | PStruct<any>> =
    PT extends ToPType<infer T extends TermType> ? T : // !!! IMPORTANT !!! can only be present in one of the two types; breaks TypeScript LSP otherwise
    PT extends PInt         ? [ PrimType.Int ] :
    PT extends PByteString  ? [ PrimType.BS  ] :
    PT extends PString      ? [ PrimType.Str ] :
    PT extends PUnit        ? [ PrimType.Unit ] :
    PT extends PBool        ? [ PrimType.Bool ] :
    PT extends PList<infer TyArg extends PType>     ? [ PrimType.List, FromPType< TyArg > ] :
    PT extends PPair<infer FstTyArg extends PType, infer SndTyArg extends PType>     ? [ PrimType.Pair, FromPType< FstTyArg >, FromPType< SndTyArg > ] :
    PT extends PDelayed<infer TyArg extends PType>  ? [ PrimType.Delayed, FromPType< TyArg > ] :
    PT extends PLam<infer FstTyArg extends PType, infer SndTyArg extends PType>     ? [ PrimType.Lambda, FromPType< FstTyArg >, FromPType< SndTyArg > ] :
    PT extends PData    ? [ DataConstructor, ...DataType[] ] :
    PT extends PStruct<infer SDef extends ConstantableStructDefinition> ? [ typeof structType, SDef ] :
    PT extends PType    ? TermType :
    // PT extends ToPType<infer T extends TermType> ? T :
    never;

export type FromPTypeConstantable<PTy extends PDataRepresentable | ToPType<ConstantableTermType> | PStruct<any>> =
    PTy extends ToPType< infer TermTy extends ConstantableTermType > ? TermTy : // !!! IMPORTANT !!! can only be present in one of the two types; breaks TypeScript LSP otherwise
    PTy extends PInt         ? [ PrimType.Int ] :
    PTy extends PByteString  ? [ PrimType.BS  ] :
    PTy extends PString      ? [ PrimType.Str ] :
    PTy extends PUnit        ? [ PrimType.Unit ] :
    PTy extends PBool        ? [ PrimType.Bool ] :
    PTy extends PList<infer TyArg extends PDataRepresentable> ? [ PrimType.List, FromPTypeConstantable< TyArg > ] :
    PTy extends PPair<infer FstTyArg extends PDataRepresentable, infer SndTyArg extends PDataRepresentable> ?
        [ PrimType.Pair, FromPTypeConstantable< FstTyArg >, FromPTypeConstantable< SndTyArg > ] :
    PTy extends PData    ? [ DataConstructor, ...DataType[] ] :
    PTy extends PStruct<infer SDef extends ConstantableStructDefinition> ? [ typeof structType, SDef ] :
    never;



export type FromPTypeArr<PTs extends PType[]> =
    PTs extends [] ? [] :
    PTs extends [ infer PT extends PType ] ? [ FromPType<PT> ] :
    PTs extends [ infer PT extends PType, ...infer RestPTs extends PType[] ] ? [ FromPType<PT>, ...FromPTypeArr<RestPTs> ] :
    never;

export type ToPTypeArr<Ts extends TermType[]> =
    Ts extends [] ? [] & PType[] :
    Ts extends [infer T extends TermType] ? [ ToPType<T> ] & [ PType ] :
    Ts extends [infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ? [ ToPType<T>, ...ToPTypeArr<RestTs> ] & [ PType, ...PType[] ] :
    never;

export type ToPTypeArrNonEmpty<Ts extends[ TermType, ...TermType[] ]> =
    Ts extends [] ? never :
    Ts extends [infer T extends TermType] ? [ ToPType<T> ] & [ PType ] :
    Ts extends [infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ? [ ToPType<T>, ...ToPTypeArr<RestTs> ] & [ PType, ...PType[] ] :
    never;

export type ToTermArr<Ts extends TermType[]> =
    Ts extends [] ? [] & Term<PType>[] :
    Ts extends [infer T extends TermType] ? [ Term<ToPType<T>>] & [ Term<PType> ] :
    Ts extends [infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ? [ Term<ToPType<T>>, ...ToTermArr<RestTs> ] & [ Term<PType>, ...Term<PType>[] ] :
    never;

export type ToTermArrNonEmpty<Ts extends [ TermType, ...TermType[] ]> =
    Ts extends [] ? never & Term<PType>[] :
    Ts extends [infer T extends TermType] ? [ Term<ToPType<T>>] & [ Term<PType> ] :
    Ts extends [infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ? [ Term<ToPType<T>>, ...ToTermArr<RestTs> ] & [ Term<PType>, ...Term<PType>[] ] :
    never;


