import { BaseDataRepPrimType, BasePrimType, DataRepPrimType, PrimType } from "../types";

export function isPrimTypeTag( t: any ): t is PrimType
{
    switch( t as PrimType )
    {
        case PrimType.Alias:
        case PrimType.AsData:
        case PrimType.BS:
        case PrimType.bls12_381_G1_element:
        case PrimType.bls12_381_G2_element:
        case PrimType.bls12_381_MlResult:
        case PrimType.Bool:
        case PrimType.Data:
        case PrimType.Delayed:
        case PrimType.Int:
        case PrimType.Lambda:
        case PrimType.List:
        case PrimType.Pair:
        case PrimType.Str:
        case PrimType.Struct:
        case PrimType.Sop:
        case PrimType.Unit:
            return true;
        default:
            return false;
    }
}

export function isBasePrimType( t: any ): t is BasePrimType
{
    switch( t as PrimType )
    {
        case PrimType.BS:
        case PrimType.bls12_381_G1_element:
        case PrimType.bls12_381_G2_element:
        case PrimType.bls12_381_MlResult:
        case PrimType.Bool:
        case PrimType.Data:
        case PrimType.Int:
        case PrimType.Str:
        case PrimType.Unit:
            return true;
        default:
            return false;
    }
}


export function isBaseDataRepPrimType( t: any ): t is BaseDataRepPrimType
{
    switch( t as PrimType )
    {
        case PrimType.BS:
        case PrimType.Bool:
        case PrimType.Data:
        case PrimType.Int:
        case PrimType.Str:
        case PrimType.Unit:
            return true;
        default:
            return false;
    }
}