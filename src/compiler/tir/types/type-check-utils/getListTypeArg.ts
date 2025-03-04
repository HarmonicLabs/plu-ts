import { TirAliasType } from "../TirAliasType";
import { TirListT } from "../TirNativeType";
import { TirType } from "../TirType";

export function getListTypeArg( list_t: TirType ): TirType | undefined
{
    while( list_t instanceof TirAliasType ) list_t = list_t.aliased;
    if( list_t instanceof TirListT ) return list_t.typeArg;
    return undefined;
}