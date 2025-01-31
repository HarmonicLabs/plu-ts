import { PrimType, TermType } from "./types";
import { unwrapAlias } from "./tyArgs/unwrapAlias";
import { ConstType, constT } from "@harmoniclabs/uplc";

export function termTyToConstTy( t: TermType ): ConstType
{
    switch( t[0] )
    {
        case PrimType.Alias:    return termTyToConstTy( unwrapAlias( t as any ) );
        case PrimType.Unit:     return constT.unit;
        case PrimType.Int:      return constT.int;
        case PrimType.BS:       return constT.byteStr;
        case PrimType.bls12_381_G1_element:       return constT.bls12_381_G1_element;
        case PrimType.bls12_381_G2_element:       return constT.bls12_381_G2_element;
        case PrimType.bls12_381_MlResult  :       return constT.bls12_381_MlResult  ;
        case PrimType.Bool:     return constT.bool;
        case PrimType.Str:      return constT.str;
        case PrimType.Struct:
        case PrimType.Data:
        case PrimType.AsData:   return constT.data; 
        case PrimType.List:     return constT.listOf( termTyToConstTy( t[1] ) );
        case PrimType.Pair:     return constT.pairOf( termTyToConstTy( t[1] ), termTyToConstTy( t[2] ) )

        case PrimType.Delayed:
        case PrimType.Lambda:
        case PrimType.Sop:
        default:
            throw new Error("unable to convert term type to uplc constant type")
    }
}