import { TirAliasType } from "../TirAliasType";
import { TirListT } from "../TirNativeType";
import { isTirType, TirType } from "../TirType";

export function getUnaliased( t: TirType ): TirType
{
    if( !isTirType( t ) ) throw new Error(`getUnaliased: expected a TirType, got ${t}`);
    while( t instanceof TirAliasType ) t = t.aliased;
    return t;
}