import { isObject } from "@harmoniclabs/obj-utils";
import { TirAliasType } from "./TirAliasType";
import { TirStructType } from "./TirStructType";
import { isTirNativeType, TirNativeType } from "./TirNativeType";
import { TirTypeParam } from "./TirTypeParam";

export type TirType
    = TirNativeType
    | TirCustomType
    | TirTypeParam
    ;

export function isTirType( thing: any ): thing is TirType
{
    return isObject( thing ) && (
        isTirNativeType( thing )
        || isTirCustomType( thing )
    );
}

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