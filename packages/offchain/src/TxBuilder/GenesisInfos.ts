import { hasOwn } from "@harmoniclabs/obj-utils";
import { CanBeUInteger, canBeUInteger } from "../utils/ints";


export interface GenesisInfos {
    /**
     * ### POSIX timestamp of blockchain start
     * ## with **milliseconds precision**
    **/
    readonly systemStartPOSIX: CanBeUInteger,
    /**
     * ### slot duration in **milliseconds**
    **/
    readonly slotLengthInMilliseconds: CanBeUInteger
}

export const defaultPreviewGenesisInfos: GenesisInfos = Object.freeze({
    systemStartPOSIX: 1666656000_000,
    slotLengthInMilliseconds: 1000
} as GenesisInfos);

export const defaultPreprodGenesisInfos: GenesisInfos = Object.freeze({
    systemStartPOSIX: 1666656000_000,
    slotLengthInMilliseconds: 1000
} as GenesisInfos);

export const defaultMainnetGenesisInfos: GenesisInfos = Object.freeze({
    systemStartPOSIX: 1506203091_000,
    slotLengthInMilliseconds: 1000
} as GenesisInfos);

export function isGenesisInfos( stuff: any ): stuff is GenesisInfos
{
    return (
        typeof stuff === "object" && stuff !== null &&
        hasOwn( stuff, "systemStartPOSIX" ) && 
        canBeUInteger( stuff.systemStartPOSIX ) &&
        hasOwn( stuff, "slotLengthInMilliseconds" ) &&
        canBeUInteger( stuff.slotLengthInMilliseconds )
    );
}