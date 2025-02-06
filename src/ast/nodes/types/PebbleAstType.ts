import { isObject } from "@harmoniclabs/obj-utils";
import { isNativeType, NativeType } from "./NativeType";
import { NamedType } from "./NamedType";

export type PebbleAstType
    = NativeType
    | NamedType
    ;

export function isPebbleAstType( obj: any ): obj is PebbleAstType
{
    return isObject( obj ) && (
        isNativeType( obj ) ||
        (obj instanceof NamedType)
    );
}