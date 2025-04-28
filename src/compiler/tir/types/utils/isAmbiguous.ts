import { TirAliasType } from "../TirAliasType";
import { TirFuncT, TirLinearMapT, TirListT, TirOptT } from "../TirNativeType";
import { TirStructType } from "../TirStructType";
import { TirType } from "../TirType";
import { TirTypeParam } from "../TirTypeParam";


/**
 * returns true if the type is either:
 * - a type parameter (generic)
 * - an "unrestricted" struct or optional type (can be both data and SoP encoding, so is ambiguous)
 * - a generic (list, maps, etc.) of any of the above
 * - a function that includes any of the above
 * - an alias of any of the above
 */
export function isAmbiguous( type: TirType ): boolean
{
    while( type instanceof TirAliasType ) type = type.aliased;

    if( type instanceof TirTypeParam ) return true;
    if( type instanceof TirStructType ) return !(type.onlyData() || type.onlySoP());
    if( type instanceof TirOptT ) return !(type.onlyData() || type.onlySoP()) || isAmbiguous( type.typeArg );

    if( type instanceof TirListT ) return isAmbiguous( type.typeArg );
    if( type instanceof TirLinearMapT ) return isAmbiguous( type.keyTypeArg ) || isAmbiguous( type.valTypeArg );

    if( type instanceof TirFuncT ) return (
        type.argTypes.some( isAmbiguous )
        || isAmbiguous( type.returnType )
    );

    return false;
}