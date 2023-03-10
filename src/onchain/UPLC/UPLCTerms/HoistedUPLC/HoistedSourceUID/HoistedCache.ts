import { HoistedSourceUID } from ".";
import { HoistedUPLC } from "..";

const hoistedCache = new Map<HoistedSourceUID, HoistedUPLC>();

export function get( uid: HoistedSourceUID ): HoistedUPLC | undefined
{
    return hoistedCache.get( uid )?.clone()
}

export function registerUID( uid: HoistedSourceUID, hoisted: HoistedUPLC ): void
{
    return void hoistedCache.set( uid, hoisted.clone() );
}