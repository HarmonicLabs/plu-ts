import { isObject } from "@harmoniclabs/obj-utils";
import { TirConcreteAliasType } from "./TirConcreteAliasType";
import { TirConcreteStructType } from "./TirConcreteStructType";
import { isTirNativeType, TirNativeType } from "./TirNativeType";
// import { TirInterfaceType } from "./TirInterfaceType";

export type TirConcreteType
    = TirNativeType
    | TirConcreteCustomType
    ;

export function isTirConcreteType( thing: any ): thing is TirConcreteType
{
    return isObject( thing ) && (
        isTirNativeType( thing )
        || isTirConcreteCustomType( thing )
    );
}

export type TirConcreteCustomType
    = TirConcreteAliasType
    | TirConcreteStructType
    ;

export function isTirConcreteCustomType( thing: any ): thing is TirConcreteCustomType
{
    return isObject( thing ) && (
        thing instanceof TirConcreteAliasType
        || thing instanceof TirConcreteStructType
    );
}