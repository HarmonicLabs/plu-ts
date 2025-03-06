import { TirAliasType } from "../TirAliasType";
import { TirListT } from "../TirNativeType";
import { TirType } from "../TirType";

export function getUnaliased( t: TirType ): TirType
{
    while( t instanceof TirAliasType ) t = t.aliased;
    return t;
}