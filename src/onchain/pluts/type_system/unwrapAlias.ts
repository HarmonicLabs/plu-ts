import { GenericTermType, TermType } from "./types";

export function unwrapAlias( t: TermType ): TermType
export function unwrapAlias( t: GenericTermType ): GenericTermType
export function unwrapAlias( t: GenericTermType ): GenericTermType
{
    return t[1] as any;
}