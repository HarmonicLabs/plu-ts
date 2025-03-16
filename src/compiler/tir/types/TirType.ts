import { isObject } from "@harmoniclabs/obj-utils";
import { TirAliasType } from "./TirAliasType";
import { TirStructType } from "./TirStructType";
import { isTirNamedDestructableNativeType, isTirNativeType, TirNamedDestructableNativeType, TirNativeType } from "./TirNativeType";
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

export type TirNamedDestructableType
    = TirNamedDestructableNativeType
    | TirStructType
    ;

export function isTirNamedDestructableType( thing: any ): thing is TirNamedDestructableType
{
    return isObject( thing ) && (
        thing instanceof TirStructType
        || isTirNamedDestructableNativeType( thing )
    );
}