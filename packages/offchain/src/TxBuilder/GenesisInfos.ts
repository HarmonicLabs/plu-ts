import { hasOwn } from "@harmoniclabs/obj-utils";
import { CanBeUInteger, canBeUInteger } from "../utils/ints";


export interface GenesisInfos {
    /**
     * @deprecated use `systemStartPosixMs` instead
     * 
     * POSIX timestamp of blockchain start
     * with **milliseconds precision**
    **/
    systemStartPOSIX?: CanBeUInteger,
    /**
     * 
     * POSIX timestamp of blockchain start
     * with **milliseconds precision**
    **/
    readonly systemStartPosixMs?: CanBeUInteger,
    /**
     * @deprecated use `slotLengthMs` instead
     * 
     * slot duration in **milliseconds**
    **/
    slotLengthInMilliseconds?: CanBeUInteger
    /**
     * slot duration in **milliseconds**
    **/
    readonly slotLengthMs?: CanBeUInteger
    /**
     * slot number of the slot at `systemStartPosixMs` time
     * 
     * @default 0
     */
    readonly startSlotNo?: CanBeUInteger
}

export interface NormalizedGenesisInfos {
    /**
     * 
     * POSIX timestamp of blockchain start
     * with **milliseconds precision**
    **/
    readonly systemStartPosixMs: number,
    /**
     * slot duration in **milliseconds**
    **/
    readonly slotLengthMs: number
    /**
     * slot number of the slot at `systemStartPosixMs` time
     */
    readonly startSlotNo: number
}

export function normalizedGenesisInfos( gInfo: GenesisInfos ): NormalizedGenesisInfos
{
    return Object.freeze({
        systemStartPosixMs: Number( gInfo.systemStartPosixMs ?? gInfo.systemStartPOSIX ),
        slotLengthMs: Number( gInfo.slotLengthMs ?? gInfo.slotLengthInMilliseconds ),
        startSlotNo: Number( gInfo.startSlotNo ?? 0 )
    } as NormalizedGenesisInfos);
}

export const defaultPreviewGenesisInfos: GenesisInfos = Object.freeze({
    systemStartPOSIX  : 1_666_656_000_000,
    systemStartPosixMs: 1_666_656_000_000,
    slotLengthInMilliseconds: 1000,
    slotLengthMs            : 1000,
    startSlotNo: 0
} as GenesisInfos);

export const defaultPreprodGenesisInfos: GenesisInfos = Object.freeze({
    systemStartPOSIX  : 1_654_041_600_000 + 1_728_000_000,
    systemStartPosixMs: 1_654_041_600_000 + 1_728_000_000,
    slotLengthInMilliseconds: 1000,
    slotLengthMs            : 1000,
    startSlotNo: 86400
} as GenesisInfos);

export const defaultMainnetGenesisInfos: GenesisInfos = Object.freeze({
    systemStartPOSIX  : 1_596_059_091_000,
    systemStartPosixMs: 1_596_059_091_000,
    slotLengthInMilliseconds: 1000,
    slotLengthMs            : 1000,
    startSlotNo: 4492800
} as GenesisInfos);

export function isGenesisInfos( stuff: any ): stuff is GenesisInfos
{
    return (
        typeof stuff === "object" && stuff !== null &&
        ((
            hasOwn( stuff, "systemStartPOSIX" ) && 
            canBeUInteger( stuff.systemStartPOSIX )
        ) || (
            hasOwn( stuff, "systemStartPosixMs" ) && 
            canBeUInteger( stuff.systemStartPosixMs )
        )) &&
        ((
            hasOwn( stuff, "slotLengthInMilliseconds" ) &&
            canBeUInteger( stuff.slotLengthInMilliseconds )
        ) || (
            hasOwn( stuff, "slotLengthMs" ) &&
            canBeUInteger( stuff.slotLengthMs )
        )) && (
            hasOwn( stuff, "startSlotNo" ) &&
            canBeUInteger( stuff.startSlotNo )
        )

    );
}

export function isNormalizedGenesisInfos( stuff: any ): stuff is NormalizedGenesisInfos
{
    return (
        typeof stuff === "object" && stuff !== null &&
        (
            hasOwn( stuff, "systemStartPosixMs" ) && 
            (typeof stuff.systemStartPosixMs === "number")
        ) &&
        (
            hasOwn( stuff, "slotLengthMs" ) &&
            canBeUInteger( stuff.slotLengthMs )
        ) && (
            hasOwn( stuff, "startSlotNo" ) &&
            canBeUInteger( stuff.startSlotNo )
        )
    );
}