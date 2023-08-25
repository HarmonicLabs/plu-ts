import { GenericTermType, PrimType, TermType } from "../types";

export function getFstT<T extends GenericTermType>( t: [ PrimType.Alias,  [ PrimType.Pair, T, GenericTermType ], any ] ): T
export function getFstT<T extends GenericTermType>( t: [ PrimType.AsData, [ PrimType.Pair, T, GenericTermType ] ] ): T
export function getFstT<T extends GenericTermType>( t: [ PrimType.Pair, T, GenericTermType ] ): T
export function getFstT( t: TermType ): TermType
export function getFstT( t: GenericTermType ): GenericTermType
export function getFstT( t: GenericTermType ): GenericTermType
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
    
    t = t[1] as any;

    return t as any;
}