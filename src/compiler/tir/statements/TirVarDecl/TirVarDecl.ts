import { TirNamedDeconstructVarDecl } from "./TirNamedDeconstructVarDecl";
import { TirSimpleVarDecl } from "./TirSimpleVarDecl";
import { TirSingleDeconstructVarDecl } from "./TirSingleDeconstructVarDecl";
import { TirArrayLikeDeconstr } from "./TirArrayLikeDeconstr";
import { isObject } from "@harmoniclabs/obj-utils";

export type TirVarDecl
    = TirSimpleVarDecl
    | TirNamedDeconstructVarDecl
    | TirSingleDeconstructVarDecl
    | TirArrayLikeDeconstr
    ;

export function isTirVarDecl( thing: any ): thing is TirVarDecl
{
    return isObject( thing ) && (
        thing instanceof TirSimpleVarDecl
        || thing instanceof TirNamedDeconstructVarDecl
        || thing instanceof TirSingleDeconstructVarDecl
        || thing instanceof TirArrayLikeDeconstr
    );
}