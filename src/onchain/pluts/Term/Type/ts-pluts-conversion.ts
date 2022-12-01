import { DataType, DataConstructor, TermType, PrimType, LambdaType, AliasTermType, ConstantableTermType, structType, StructDefinition, anyStruct, ConstantableStructDefinition } from ".";
import { PData, PInt, PByteString, PString, PUnit, PBool, PList, PPair, PDelayed, PLam, PStruct, PType } from "../..";
import PDataRepresentable from "../../PType/PDataRepresentable";
import { PAlias } from "../../PTypes";
import PDataBS from "../../PTypes/PData/PDataBS";
import PDataConstr from "../../PTypes/PData/PDataConstr";
import PDataInt from "../../PTypes/PData/PDataInt";
import PDataList from "../../PTypes/PData/PDataList";
import PDataMap from "../../PTypes/PData/PDataMap";
import PDataPair from "../../PTypes/PData/PDataPair";


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
T extends [ PrimType.PairAsData, infer FstTyArg extends TermType, infer SndTyArg extends TermType ]  ? PPair< ToPType<FstTyArg>, ToPType<SndTyArg> > :
T extends [ PrimType.Delayed, infer TyArg extends TermType ]  ? PDelayed< ToPType<TyArg> > :
T extends [ PrimType.Lambda, infer InputTyArg extends TermType, infer OutputTyArg extends TermType ] ?
    PLam< ToPType<InputTyArg>, ToPType<OutputTyArg> > :
T extends LambdaType<infer InputTyArg extends TermType, infer OutputTyArg extends TermType> ?
    PLam< ToPType<InputTyArg>, ToPType<OutputTyArg> > :
T extends AliasTermType<infer AliasId extends symbol, infer ActualT extends ConstantableTermType> ?
    PAlias<ActualT, AliasId> :
T extends [ typeof structType, infer SDef extends ( StructDefinition | typeof anyStruct ) ] ?
    ( SDef extends ConstantableStructDefinition ? PStruct<SDef> : PData ):
T extends [ DataConstructor, ...DataType[] ] ? PData :
// covers ```TermTypeParameter```s too
T extends TermType ? PType :
// T extends FromPType<infer PT extends PType> ? PT : // !!! IMPORTANT !!! can only be present in one of the two types; breaks TypeScript LSP otherwise
never;

export type FromPType<PT extends PType | ToPType<TermType> | PStruct<any> | PAlias<any>> =
PT extends ToPType<infer T extends TermType> ? T : // !!! IMPORTANT !!! can only be present in one of the two types; breaks TypeScript LSP otherwise
PT extends PInt         ? [ PrimType.Int ] :
PT extends PByteString  ? [ PrimType.BS  ] :
PT extends PString      ? [ PrimType.Str ] :
PT extends PUnit        ? [ PrimType.Unit ] :
PT extends PBool        ? [ PrimType.Bool ] :
PT extends PList<infer TyArg extends PType>     ? [ PrimType.List, FromPType< TyArg > ] :
PT extends PPair<infer FstTyArg extends PType, infer SndTyArg extends PType>     ?
    [ PrimType.Pair, FromPType< FstTyArg >, FromPType< SndTyArg > ] :
PT extends PDelayed<infer TyArg extends PType>  ? [ PrimType.Delayed, FromPType< TyArg > ] :
PT extends PLam<infer FstTyArg extends PType, infer SndTyArg extends PType>     ? [ PrimType.Lambda, FromPType< FstTyArg >, FromPType< SndTyArg > ] :
PT extends PData    ? [ DataConstructor, ...DataType[] ] :
PT extends PStruct<infer SDef extends ConstantableStructDefinition> ? [ typeof structType, SDef ] :
PT extends PAlias<infer T extends ConstantableTermType, infer AliasId extends symbol> ? AliasTermType<AliasId, T> :
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
