import { hasOwn, isObject } from "@harmoniclabs/obj-utils";
import { isPebbleExpr, PebbleExpr } from "../../../expr/PebbleExpr";

export interface HasInitExpr {
    readonly initExpr: PebbleExpr | undefined;
}

export function hasInitExpr( thing: any ): thing is HasInitExpr
{
    return isObject( thing ) && (
        isPebbleExpr( thing.initExpr ) ||
        (
            hasOwn( thing, "initExpr" ) &&
            typeof thing.initExpr === "undefined"
        )
    );
}