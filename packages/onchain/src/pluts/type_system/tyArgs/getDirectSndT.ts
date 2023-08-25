import { GenericTermType, PrimType, TermType } from "../types";

export function getDirectSndT<T extends GenericTermType>( t: [ PrimType.Pair,  GenericTermType, T ] ): T
export function getDirectSndT( t: TermType ): TermType
export function getDirectSndT( t: GenericTermType ): GenericTermType
export function getDirectSndT( t: GenericTermType ): GenericTermType
{
    // !!! IMPORTANT !!!
    // **this unwrapping is assumed to happen here** by `typeExtends`
    // if this ever changes please reflect the change to `typeExtends` too
    // !!! IMPORTANT !!!
    while(
        t[0] !== PrimType.Pair
    ) t = t[1] as any;

    return t[2] as any;
}