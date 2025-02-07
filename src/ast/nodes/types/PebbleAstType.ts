import { isObject } from "@harmoniclabs/obj-utils";
import { isAstNativeType, AstNativeType } from "./AstNativeType";
import { AstNamedType } from "./AstNamedType";

export type PebbleAstType
    = AstNativeType
    | AstNamedType
    ;

export function isPebbleAstType( obj: any ): obj is PebbleAstType
{
    return isObject( obj ) && (
        isAstNativeType( obj ) ||
        (obj instanceof AstNamedType)
    );
}