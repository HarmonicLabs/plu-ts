import { TirSoPStructType, TirDataStructType } from "../../tir/types/TirStructType";
import { TirType } from "../../tir/types/TirType";
import { getUnaliased } from "../../tir/types/utils/getUnaliased";

export function isSingleConstrStruct( type: TirType ): type is ( TirSoPStructType | TirDataStructType )
{
    type = getUnaliased( type );

    if(!(
        type instanceof TirSoPStructType
        || type instanceof TirDataStructType
    )) return false;

    return type.constructors.length === 1;
}