import { GenericTermType, PrimType, TermType } from "../types";

export function getDirectFstT<T extends GenericTermType>( t: [ PrimType.Pair, T, GenericTermType ] ): T
export function getDirectFstT( t: TermType ): TermType
export function getDirectFstT( t: GenericTermType ): GenericTermType
export function getDirectFstT( t: GenericTermType ): GenericTermType
{
    // !!! IMPORTANT !!!
    // **this unwrapping is assumed to happen here** by `typeExtends`
    // if this ever changes please reflect the change to `typeExtends` too
    // !!! IMPORTANT !!!
    while(
        t[0] !== PrimType.Pair
    ) t = t[1] as any;

    return t[1] as any;
}