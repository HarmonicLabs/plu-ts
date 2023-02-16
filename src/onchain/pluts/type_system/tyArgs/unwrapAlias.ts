import { PrimType, TermType } from "../types";

export function unwrapAlias<T extends TermType>( t: [ PrimType.Alias, T  ] ): T
{
    return t[1] as any;
}