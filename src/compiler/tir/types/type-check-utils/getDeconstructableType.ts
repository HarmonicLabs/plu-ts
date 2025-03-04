import { TirAliasType } from "../TirAliasType";
import { TirDataT, TirLinearMapT, TirListT, TirOptT } from "../TirNativeType";
import { TirStructType } from "../TirStructType";
import { TirType } from "../TirType";

export type DeconstructableTirType = TirStructType | TirOptT | TirListT | TirLinearMapT | TirDataT;

export function getDeconstructableType(
    type: TirType
): DeconstructableTirType | undefined
{
    while( type instanceof TirAliasType ) type = type.aliased;
    if( type instanceof TirStructType ) return type;
    if( type instanceof TirOptT ) return type;
    if( type instanceof TirListT ) return type;
    if( type instanceof TirLinearMapT ) return type;
    if( type instanceof TirDataT ) return type; // builtin choose data
    return undefined;
}