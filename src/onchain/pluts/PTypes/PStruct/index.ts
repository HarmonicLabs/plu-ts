import { ConstantableStructDefinition } from "../../Term/Type/base";
import _pmatch from "./pmatch";
import _pstruct, { 
    PStruct as _PStruct } from "./pstruct";

export const pmatch = _pmatch;
export const pstruct = _pstruct;

export type PStruct<SDef extends ConstantableStructDefinition> = _PStruct<SDef>