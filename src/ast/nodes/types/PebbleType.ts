import { isObject } from "@harmoniclabs/obj-utils";

export type PebbleType = todo;

export function isPebbleType( obj: any ): obj is PebbleType
{
    return isObject( obj ) && (
        todo
    );
}