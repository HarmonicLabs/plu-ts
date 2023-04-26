import { CanBeUInteger, canBeUInteger } from "../../../../types/ints/Integer";
import ObjectUtils from "../../../../utils/ObjectUtils"

export interface GenesisInfos {
    systemStartPOSIX: CanBeUInteger,
    slotLengthInMilliseconds: CanBeUInteger
}

export function isGenesisInfos( stuff: any ): stuff is GenesisInfos
{
    return (
        typeof stuff === "object" && stuff !== null &&
        ObjectUtils.hasOwn( stuff, "systemStartPOSIX" ) && 
        canBeUInteger( stuff.systemStartPOSIX ) &&
        ObjectUtils.hasOwn( stuff, "slotLengthInMilliseconds" ) &&
        canBeUInteger( stuff.slotLengthInMilliseconds )
    );
}