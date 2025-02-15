import { isObject } from "@harmoniclabs/obj-utils";
import { isAstNativeTypeExpr, AstNativeTypeExpr } from "./AstNativeTypeExpr";
import { AstNamedTypeExpr } from "./AstNamedTypeExpr";

export type AstTypeExpr
    = AstNativeTypeExpr
    | AstNamedTypeExpr
    ;

export function isAstTypeExpr( obj: any ): obj is AstTypeExpr
{
    return isObject( obj ) && (
        isAstNativeTypeExpr( obj ) ||
        (obj instanceof AstNamedTypeExpr)
    );
}