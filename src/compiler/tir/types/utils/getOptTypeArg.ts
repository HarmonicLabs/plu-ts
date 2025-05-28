import { TirAliasType } from "../TirAliasType";
import { TirDataOptT, TirSopOptT } from "../TirNativeType";
import { TirType } from "../TirType";

export function getOptTypeArg( opt_t: TirType ): TirType | undefined
{
    while( opt_t instanceof TirAliasType ) opt_t = opt_t.aliased;

    if(
        opt_t instanceof TirSopOptT
        || opt_t instanceof TirDataOptT
    ) return opt_t.typeArg;
    
    return undefined;
}