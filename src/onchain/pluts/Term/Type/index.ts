import Term from "..";
import JsRuntime from "../../../../utils/JsRuntime";
import PType from "../../PType";
import PBool from "../../PTypes/PBool";
import PByteString from "../../PTypes/PByteString";
import PData from "../../PTypes/PData";
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
import PUnit from "../../PTypes/PUnit";

export const enum PrimType {
    Any  = "GenericType",
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

export type TypeName = PrimType | DataConstructor

export type DataType = [ DataConstructor, ...DataType[] ]

type LambdaType<InT extends Type, OutT extends Type> = readonly [ PrimType.Lambda, InT, OutT ];
type FnType<Ins extends [ Type, ...Type[] ], OutT extends Type> =
    Ins extends [] ? Type :
    Ins extends [ infer In extends Type ] ? LambdaType<In, OutT> :
    Ins extends [ infer In extends Type, ...infer RestIns extends [ Type, ...Type[] ] ] ? LambdaType<In, FnType< RestIns, OutT >> :
    Type;

//@ts-ignore
const Type: {
    readonly Any:   [ PrimType.Any ];
    readonly Int:   [ PrimType.Int ];
    readonly BS:    [ PrimType.BS ];
    readonly Str:   [ PrimType.Str ];
    readonly Unit:  [ PrimType.Unit ];
    readonly Bool:  [ PrimType.Bool ];
    readonly List:  <T extends Type>(ofElem: T) => [ PrimType.List, T ];
    readonly Pair:  <FstT extends Type, SndT extends Type>(fst: FstT, snd: SndT) => [ PrimType.Pair, FstT, SndT ] ;
    readonly Map:   <KeyT extends Type, ValT extends Type>(k: KeyT, v: ValT) => [PrimType.List, [PrimType.Pair, KeyT, ValT]]
    readonly Delayed: <T extends Type>(toDelay: T) => [ PrimType.Delayed, T ];
    readonly Lambda: <InT extends Type, OutT extends Type>(input: Type, output: Type) => [ PrimType.Lambda, InT, OutT ];
    readonly Fn: <InsTs extends [ Type, ...Type[] ], OutT extends Type>( inputs: InsTs, output: OutT ) => FnType<InsTs, OutT>
    readonly Data: {
        readonly Any: [ DataConstructor.Any ];
        readonly Constr: (fieldsTypes: DataType[]) => DataType;
        readonly Map: (keyType: DataType, valueType: DataType) => DataType;
        readonly Pair: (fstType: DataType, sndType: DataType) => DataType;
        readonly List: (elements: DataType) => DataType;
        readonly Int: DataType;
        readonly BS: DataType;
    }
 } = Object.freeze({
    Any:        Object.freeze([ PrimType.Any ]),
    Int:        Object.freeze([ PrimType.Int ]),
    BS:         Object.freeze([ PrimType.BS ]),
    Str:        Object.freeze([ PrimType.Str ]),
    Unit:       Object.freeze([ PrimType.Unit ]),
    Bool:       Object.freeze([ PrimType.Bool ]),
    List:       <T extends Type>( ofElem: T ): readonly [ PrimType.List, T ] => Object.freeze([ PrimType.List, ofElem ]) ,
    Pair:       <FstT extends Type, SndT extends Type>( fst: FstT, snd: SndT ): readonly [ PrimType.Pair, FstT, SndT ] => Object.freeze([ PrimType.Pair, fst, snd ]),
    Map:        <KeyT extends Type, ValT extends Type>( k: KeyT, v: ValT ) => Type.List( Type.Pair( k, v ) ),
    Delayed:    <T extends Type>( toDelay: T ): readonly [ PrimType.Delayed, T ] => Object.freeze([ PrimType.Delayed, toDelay ]),
    Lambda:     <InT extends Type, OutT extends Type>( input: InT, output: OutT ): LambdaType< InT, OutT > => Object.freeze([ PrimType.Lambda, input, output ]),
    Fn:         <InsTs extends [ Type, ...Type[] ], OutT extends Type>( inputs: InsTs , output: Type ): FnType<InsTs, OutT> => {
        JsRuntime.assert(
            inputs.length > 0,
            "unsupported '(void) => any' type at Pluts level"
        );

        if( inputs.length === 1 ) return Object.freeze( Type.Lambda( inputs[0], output ) ) as any;

        return Object.freeze( Type.Lambda( inputs[ 0 ], Type.Fn( inputs.slice( 1 ) as [ Type, ...Type[] ], output ) ) ) as any;
    },
    Data: Object.freeze({
        Any:    Object.freeze([ DataConstructor.Any ]),
        Constr: ( fieldsTypes: DataType[] ) => Object.freeze([ DataConstructor.Constr, ...fieldsTypes ]),
        Map:    ( keyType: DataType, valueType: DataType ) => Object.freeze( Type.Data.List( Type.Data.Pair( keyType, valueType) ) ),
        Pair:   ( fstType: DataType, sndType: DataType ) => Object.freeze([ DataConstructor.Pair, fstType, sndType ]),
        List:   ( elements: DataType ) => Object.freeze([ DataConstructor.List, elements ]),
        Int:    Object.freeze([ DataConstructor.Int ]),
        BS:     Object.freeze([ DataConstructor.BS ])
    })
});

export default Type;

// Type = TypeName followed by optional (nested) Types
export type Type = readonly [ TypeName, ...Type[] ];

export type ToPDataType<DT extends DataType> =
    DT extends [ DataConstructor.Int ] ? PDataInt :
    DT extends [ DataConstructor.BS  ] ? PDataBS  :
    DT extends [ DataConstructor.List, [ DataConstructor.Pair, infer DataK extends DataType, infer DataV extends DataType] ] ? PDataMap<ToPDataType<DataK>, ToPDataType<DataV>> :
    DT extends [ DataConstructor.List, infer DataElemT extends DataType ] ? PDataList<ToPDataType<DataElemT>> :
    DT extends [ DataConstructor.Pair, infer DataFst extends DataType, infer DataSnd extends DataType ] ? PDataPair<ToPDataType<DataFst>,ToPDataType<DataSnd>> :
    DT extends [ DataConstructor.Constr, ...infer FieldsDataTypes extends DataType[] ] ? PDataConstr<ToPDataTypeArr<FieldsDataTypes>> :
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
    PDT extends PDataConstr<infer PDataConstrArgs extends PData[]> ? [ DataConstructor.Constr, ...FromPDataTypeArr<PDataConstrArgs> ] :
    PDT extends PData ? DataType :
    never;

export type FromPDataTypeArr<PDTArr extends PData[]> =
    PDTArr extends [] ? [] & DataType[] :
    PDTArr extends [ infer PDT extends PData ] ? [ FromPDataType<PDT> ] :
    PDTArr extends [ infer PDT extends PData, ...infer RestPDTs extends PData[] ] ? [ FromPDataType<PDT>, ...FromPDataTypeArr<RestPDTs> ] :
    never;

export type ToPType<T extends Type> =
    T extends [ PrimType.Int ]   ? PInt :
    T extends [ PrimType.BS ]    ? PByteString :
    T extends [ PrimType.Str ]   ? PString :
    T extends [ PrimType.Unit ]  ? PUnit :
    T extends [ PrimType.Bool ]  ? PBool :
    T extends [ PrimType.List, infer ListTyArg extends Type ]  ? PList< ToPType<ListTyArg> > :
    T extends [ PrimType.Pair, infer FstTyArg extends Type, infer SndTyArg extends Type ]  ? PPair< ToPType<FstTyArg>, ToPType<SndTyArg> > :
    T extends [ PrimType.Delayed, infer TyArg extends Type ]  ? PDelayed< ToPType<TyArg> > :
    T extends [ PrimType.Lambda, infer InputTyArg extends Type, infer OutputTyArg extends Type ]  ? PLam< ToPType<InputTyArg>, ToPType<OutputTyArg> > :
    T extends [ DataConstructor, ...DataType[] ] ? PData :
    T extends Type ? PType :
    // T extends FromPType<infer PT extends PType> ? PT :
    never;

export type FromPType< PT extends PType | ToPType<Type> > =
    PT extends ToPType<infer T extends Type> ? T : // !!! IMPORTANT !!! can only be present in one of the two types; breaks TypeScript LSP otherwise
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
    PT extends PType    ? Type :
    // PT extends ToPType<infer T extends Type> ? T :
    never;

export type FromPTypeArr<PTs extends PType[]> =
    PTs extends [] ? [] :
    PTs extends [ infer PT extends PType ] ? [ FromPType<PT> ] :
    PTs extends [ infer PT extends PType, ...infer RestPTs extends PType[] ] ? [ FromPType<PT>, ...FromPTypeArr<RestPTs> ] :
    never;

export type ToPTypeArr<Ts extends Type[]> =
    Ts extends [] ? [] & PType[] :
    Ts extends [infer T extends Type] ? [ ToPType<T> ] & [ PType ] :
    Ts extends [infer T extends Type, ...infer RestTs extends [ Type, ...Type[] ] ] ? [ ToPType<T>, ...ToPTypeArr<RestTs> ] & [ PType, ...PType[] ] :
    never;

export type ToPTypeArrNonEmpty<Ts extends[ Type, ...Type[] ]> =
    Ts extends [] ? never :
    Ts extends [infer T extends Type] ? [ ToPType<T> ] & [ PType ] :
    Ts extends [infer T extends Type, ...infer RestTs extends [ Type, ...Type[] ] ] ? [ ToPType<T>, ...ToPTypeArr<RestTs> ] & [ PType, ...PType[] ] :
    never;

export type ToTermArr<Ts extends Type[]> =
    Ts extends [] ? [] & Term<PType>[] :
    Ts extends [infer T extends Type] ? [ Term<ToPType<T>>] & [ Term<PType> ] :
    Ts extends [infer T extends Type, ...infer RestTs extends [ Type, ...Type[] ] ] ? [ Term<ToPType<T>>, ...ToTermArr<RestTs> ] & [ Term<PType>, ...Term<PType>[] ] :
    never;

export type ToTermArrNonEmpty<Ts extends [ Type, ...Type[] ]> =
    Ts extends [] ? never & Term<PType>[] :
    Ts extends [infer T extends Type] ? [ Term<ToPType<T>>] & [ Term<PType> ] :
    Ts extends [infer T extends Type, ...infer RestTs extends [ Type, ...Type[] ] ] ? [ Term<ToPType<T>>, ...ToTermArr<RestTs> ] & [ Term<PType>, ...Term<PType>[] ] :
    never;


