import { GenericTermType, PrimType, TermType } from "../types";

export function getFstT<T extends GenericTermType>( t: [ PrimType.Alias,  [ PrimType.Pair, T, GenericTermType ] ] ): T
export function getFstT<T extends GenericTermType>( t: [ PrimType.AsData, [ PrimType.Pair, T, GenericTermType ] ] ): T
export function getFstT<T extends GenericTermType>( t: [ PrimType.Pair, T, GenericTermType ] ): T
export function getFstT( t: TermType ): TermType
export function getFstT( t: GenericTermType ): GenericTermType
export function getFstT( t: GenericTermType ): GenericTermType
{
    while(
        t[0] === PrimType.AsData || 
        t[0] === PrimType.Alias
    ) t = t[1];

    return t[1] as any;
}