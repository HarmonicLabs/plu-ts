import type { ConstantableTermType } from "../../Term/Type";
import _palias from "./palias";
import type { PAlias as _PAlias } from "./palias";
import _unwrapAlias from "./unwrapAlias";

export * from "./palias";
export * from "./unwrapAlias";

export const palias = _palias;
export const unwrapAlias = _unwrapAlias;

export type PAlias<T extends ConstantableTermType, AliasId extends symbol = symbol> = _PAlias<T, AliasId>;