import { isObject } from "@harmoniclabs/obj-utils";
import { isTirNativeType, TirNativeType } from "./TirNativeType";
import { TirTypeParam } from "./TirTypeParam";
import { TirAliasType } from "./TirAliasType";
import { TirStructType } from "./TirStructType";
// import { TirInterfaceType } from "./TirInterfaceType";


export type TirCustomType
    = TirAliasType
    | TirStructType
    ;

export function isTirCustomType( thing: any ): thing is TirCustomType
{
    return isObject( thing ) && (
        thing instanceof TirAliasType
        || thing instanceof TirStructType
    );
}

export type TirType
    = TirNativeType
    | TirTypeParam
    | TirCustomType
    // | TirInterfaceType
    ;

export function isTirType( thing: any ): thing is TirType
{
    return isObject( thing ) && (
        isTirNativeType( thing )
        || thing instanceof TirTypeParam
        || isTirCustomType( thing )
        // || thing instanceof TirInterfaceType
    );
}