import { TirAliasType } from "../TirAliasType";
import { TirDataOptT } from "../TirNativeType/native/Optional/data";
import { TirSopOptT } from "../TirNativeType/native/Optional/sop";
import { isTirType, TirType } from "../TirType";

export function getOptTypeArg( opt_t: TirType ): TirType | undefined
{
    if( !isTirType( opt_t ) )
    throw new Error("getOptTypeArg: not a TirType");

    while( opt_t instanceof TirAliasType ) opt_t = opt_t.aliased;

    if(
        opt_t instanceof TirSopOptT
        || opt_t instanceof TirDataOptT
    ) return opt_t.typeArg;
    
    return undefined;
}