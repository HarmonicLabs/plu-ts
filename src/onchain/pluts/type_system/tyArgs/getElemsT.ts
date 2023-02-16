import { GenericTermType, PrimType, TermType } from "../types";

export function getElemsT<T extends GenericTermType>( t: [ PrimType.Alias,  [ PrimType.List, T ] ] ): T
export function getElemsT<T extends GenericTermType>( t: [ PrimType.AsData, [ PrimType.List, T ] ] ): T
export function getElemsT<T extends GenericTermType>( t: [ PrimType.List, T ] ): T
export function getElemsT( t: TermType ): TermType
export function getElemsT( t: GenericTermType ): GenericTermType
export function getElemsT( t: GenericTermType ): GenericTermType
{
    while( t[0] === PrimType.AsData ) t = t[1];
    while( t[0] === PrimType.Alias ) t = t[1];

    return t[1] as any;
}