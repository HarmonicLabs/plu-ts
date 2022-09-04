import Term from "..";
import JsRuntime from "../../../../utils/JsRuntime";
import PType from "../../PType";
import PBool from "../../PTypes/PBool";
import PByteString from "../../PTypes/PByteString";
import PData from "../../PTypes/PData";
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

export type ToPType< T extends Type > =
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


