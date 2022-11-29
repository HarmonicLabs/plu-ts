export * from "./API";
export * from "./PTypes";
export * from "./stdlib";
export * from "./Syntax";
export * from "./Term/Type";

import type _PType from "./PType";
import type TermAsClass from "./Term";

import _compile from "./Script/compile";
import _makeValidator from "./Script/makeValidator";
import type _PInt from "./PTypes/PInt";
import type _PBool from "./PTypes/PBool";
import type _PByteString from "./PTypes/PByteString";
import type _PString from "./PTypes/PString";
import type _PList from "./PTypes/PList";
import type _PUnit from "./PTypes/PUnit";
import type _PDelayed from "./PTypes/PDelayed";
import type _PPair from "./PTypes/PPair";
import type _PLam from "./PTypes/PFn/PLam";
import type _PFn from "./PTypes/PFn/PFn";
import type _PData from "./PTypes/PData/PData";
import type { ConstantableStructDefinition } from "./Term/Type/base";
import type { PStruct  as _PStruct} from "./PTypes/PStruct/pstruct";

export type PType = _PType;
export type Term<PTy extends PType> = TermAsClass<PTy>;

export type PInt = _PInt;
export type PBool = _PBool;
export type PByteString = _PByteString;
export type PString = _PString;
export type PUnit = _PUnit;
export type PData = _PData;
export type PDelayed<PTy extends PType> = _PDelayed<PTy>;
export type PList<PElemT extends PType> = _PList<PElemT>;
export type PPair<PFst extends PType, PSnd extends PType> = _PPair<PFst,PSnd>;
export type PLam<PFrom extends PType, PTo extends PType> = _PLam<PFrom,PTo>;
export type PFn<PArgsT extends [ PType, ...PType[] ], PResultT extends PType> = _PFn<PArgsT,PResultT>;

export type PStruct<SDef extends ConstantableStructDefinition> = _PStruct<SDef>;

export const compile = _compile;
export const makeValidator = _makeValidator;