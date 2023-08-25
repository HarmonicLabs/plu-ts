import { GenericTermType, PrimType, TermType } from "../types";

export function getSndT<T extends GenericTermType>( t: [ PrimType.Alias, [ PrimType.Pair, GenericTermType, T ], any ] ): T
export function getSndT<T extends GenericTermType>( t: [ PrimType.AsData, [ PrimType.Pair, GenericTermType, T ] ] ): T
export function getSndT<T extends GenericTermType>( t: [ PrimType.Pair, GenericTermType, T ] ): T
export function getSndT( t: TermType ): TermType
export function getSndT( t: GenericTermType ): GenericTermType
export function getSndT( t: GenericTermType ): GenericTermType
{    
    // !!! IMPORTANT !!!
    // **this unwrapping is assumed to happen here** by `typeExtends`
    // if this ever changes please reflect the change to `typeExtends` too
    // !!! IMPORTANT !!!
    while(
        t[0] === PrimType.AsData ||
        t[0] === PrimType.Alias
    ) t = t[1];

    if( t[0] !== PrimType.Pair )
    throw new Error("getSndT used on non-pair type");

    t = t[2];
    return t;
}