import _pmatch from "./pmatch";
import _pstruct, { 
    ConstantableStructDefinition as _ConstantableStructDefinition, 
    GenericStructDefinition as _GenericStructDefinition, 
    PStruct as _PStruct } from "./pstruct";

export const pmatch = _pmatch;
export const pstruct = _pstruct;

export type ConstantableStructDefinition = _ConstantableStructDefinition;
export type GenericStructDefinition = _GenericStructDefinition;
export type PStruct<SDef extends ConstantableStructDefinition> = _PStruct<SDef>