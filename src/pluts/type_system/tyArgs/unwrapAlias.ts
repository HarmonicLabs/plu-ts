import { PrimType, TermType } from "../types";

export function unwrapAlias<T extends TermType>( t: [ PrimType.Alias, T, any ] | T ): T
{
    while( t[0] === PrimType.Alias ) t = t[1] as any;
    return t as any;
}