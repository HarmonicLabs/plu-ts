import { PrimType } from "../types";

export function isPrimTypeTag( t: any ): t is PrimType
{
    switch( t as PrimType )
    {
        case PrimType.Alias:
        case PrimType.AsData:
        case PrimType.BS:
        case PrimType.Bool:
        case PrimType.Data:
        case PrimType.Delayed:
        case PrimType.Int:
        case PrimType.Lambda:
        case PrimType.List:
        case PrimType.Pair:
        case PrimType.Str:
        case PrimType.Struct:
        case PrimType.Unit:
            return true;
        default:
            return false;
    }
}