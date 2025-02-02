import { isObject } from "@harmoniclabs/obj-utils";
import { isNativeType, NativeType } from "./NativeType";
import { NamedType } from "./NamedType";

export type PebbleType
    = NativeType
    | NamedType
    ;

export function isPebbleType( obj: any ): obj is PebbleType
{
    return isObject( obj ) && (
        isNativeType( obj ) ||
        (obj instanceof NamedType)
    );
}