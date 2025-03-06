import { TirAliasType } from "../TirAliasType";
import { TirListT, TirOptT } from "../TirNativeType";
import { TirType } from "../TirType";

export function getOptTypeArg( list_t: TirType ): TirType | undefined
{
    while( list_t instanceof TirAliasType ) list_t = list_t.aliased;
    if( list_t instanceof TirOptT ) return list_t.typeArg;
    return undefined;
}