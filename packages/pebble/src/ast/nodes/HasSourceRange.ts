import { isObject } from "@harmoniclabs/obj-utils";
import { SourceRange } from "../Source/SourceRange";

export interface HasSourceRange {
    readonly range: SourceRange;
}

export function hasSourceRange( obj: any ): obj is HasSourceRange {
    return (
        isObject( obj ) &&
        obj.range instanceof SourceRange
    );
}