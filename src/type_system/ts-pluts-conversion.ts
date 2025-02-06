import { PAlias, PAsData, PBool, PByteString, PData, PDelayed, PInt, PLam, PList, PPair, PSop, PString, PStruct, PType, PUnit } from "../pluts";
import { PBlsG1 } from "../pluts/PTypes/PBlsG1";
import { PBlsG2 } from "../pluts/PTypes/PBlsG2";
import { PBlsMlRes } from "../pluts/PTypes/PBlsMlRes";
import { AliasT, GenericTermType, Methods, NonAliasTermType, PrimType, SopDefinition, StructDefinition, TermType } from "./types";

export type ToPType<T extends TermType> =
T extends [ PrimType.Alias, infer T extends NonAliasTermType, infer AMethods extends Methods ]  ? PAlias<ToPType<T>, AMethods> :
T extends [ PrimType.Int ]   ? PInt :
T extends [ PrimType.BS ]    ? PByteString :
T extends [ PrimType.bls12_381_G1_element  ]   ? PBlsG1     :
T extends [ PrimType.bls12_381_G2_element  ]   ? PBlsG2     :
T extends [ PrimType.bls12_381_MlResult    ]   ? PBlsMlRes  :
T extends [ PrimType.Str ]   ? PString :
T extends [ PrimType.Unit ]  ? PUnit :
T extends [ PrimType.Bool ]  ? PBool :
T extends [ PrimType.Data ]  ? PData :
T extends [ PrimType.List, infer ListTyArg extends TermType ]  ? PList<ToPType<ListTyArg>> :
T extends [ PrimType.Pair, infer FstTyArg extends TermType, infer SndTyArg extends TermType ]  ? PPair<ToPType<FstTyArg>, ToPType<SndTyArg>> :
T extends [ PrimType.Delayed, infer TyArg extends TermType ]  ? PDelayed<ToPType<TyArg>> :
T extends [ PrimType.Lambda, infer InputTyArg extends TermType, infer OutputTyArg extends TermType ] ?
    PLam<ToPType<InputTyArg>, ToPType<OutputTyArg>> :
T extends [ PrimType.Struct, infer SDef extends StructDefinition, infer SMethods extends Methods ]  ? PStruct<SDef, SMethods> :
T extends [ PrimType.Sop, infer SDef extends SopDefinition, infer SMethods extends Methods ]  ? PSop<SDef, SMethods> :
// asData elements should NOT be assignable to normal elements
T extends [ PrimType.AsData, infer ExpectedT extends TermType ] ? PAsData<ToPType<ExpectedT>> :
T extends GenericTermType ? PType :
// T extends FromPType<infer PT extends PType> ? PT : // !!! IMPORTANT !!! can only be present in one of the two types; breaks TypeScript LSP otherwise
never;

export type FromPType<PT extends PType | ToPType<TermType> /*| PStruct<any, any> | PAlias<any,any>*/> =
PT extends PInt         ? [ PrimType.Int ] :
PT extends PByteString  ? [ PrimType.BS  ] :
PT extends PBlsG1       ? [ PrimType.bls12_381_G1_element  ] :
PT extends PBlsG2       ? [ PrimType.bls12_381_G2_element  ] :
PT extends PBlsMlRes    ? [ PrimType.bls12_381_MlResult    ] :
PT extends PString      ? [ PrimType.Str ] :
PT extends PUnit        ? [ PrimType.Unit ] :
PT extends PBool        ? [ PrimType.Bool ] :
// PAsData MUST preceed PData, since every PAsData extends PData
PT extends PAsData<infer PExpected extends PType> ? [ PrimType.AsData, FromPType<PExpected> ] :
PT extends PData        ? [ PrimType.Data ] :
PT extends PList<infer TyArg extends PType> ? [ PrimType.List, FromPType<TyArg> ] :
PT extends PPair<infer FstTyArg extends PType, infer SndTyArg extends PType> ?
    [ PrimType.Pair, FromPType<FstTyArg>, FromPType<SndTyArg> ] :
PT extends PDelayed<infer TyArg extends PType>  ? [ PrimType.Delayed, FromPType<TyArg> ] :
PT extends PLam<infer FstTyArg extends PType, infer SndTyArg extends PType>     ? [ PrimType.Lambda, FromPType<FstTyArg>, FromPType<SndTyArg> ] :
PT extends PStruct<infer SDef extends StructDefinition, infer SMethods extends Methods> ? [ PrimType.Struct, SDef, SMethods ] :
PT extends PSop<infer SDef extends SopDefinition, infer SMethods extends Methods> ? [ PrimType.Sop, SDef, SMethods ] :
PT extends PAlias<infer PT extends PType, infer AMethods extends Methods> ? AliasT<FromPType<PT>, AMethods> :
PT extends ToPType<infer T extends TermType> ? T : // !!! IMPORTANT !!! can only be present in one of the two types; breaks TypeScript LSP otherwise
PT extends PType    ? GenericTermType :
// PT extends ToPType<infer T extends TermType> ? T :
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
