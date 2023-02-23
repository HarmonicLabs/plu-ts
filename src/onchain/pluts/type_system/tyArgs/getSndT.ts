import { GenericTermType, PrimType, TermType } from "../types";

export function getSndT<T extends GenericTermType>( t: [ PrimType.Alias, [ PrimType.Pair, GenericTermType, T ] ] ): T
export function getSndT<T extends GenericTermType>( t: [ PrimType.AsData, [ PrimType.Pair, GenericTermType, T ] ] ): T
export function getSndT<T extends GenericTermType>( t: [ PrimType.Pair, GenericTermType, T ] ): T
export function getSndT( t: TermType ): TermType
export function getSndT( t: GenericTermType ): GenericTermType
export function getSndT( t: GenericTermType ): GenericTermType
{
    t = t[2] as any;
    // this unwrapping is assumed in `typeExtends`
    // if this ever changes please reflect the change to `typeExtends` too
    while(
        t[0] === PrimType.AsData ||
        t[0] === PrimType.Alias
    ) t = t[1];

    return t;
}