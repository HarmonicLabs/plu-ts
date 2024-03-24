import { Address, AddressStr, CanBeHash32, Hash32, Script, canBeHash32 } from "@harmoniclabs/cardano-ledger-ts";
import { Data } from "@harmoniclabs/plutus-data";
import { CanBeData, cloneCanBeData, forceData } from "../../utils/CanBeData";

export interface ChangeInfos {
    address: Address | AddressStr,
    datum?: CanBeHash32 | CanBeData | undefined
    refScript?: Script
}

export interface NormalizedChangeInfos {
    address: Address,
    datum?: Hash32 | Data | undefined
    refScript?: Script
}

export function normalizeChangeInfos( change: ChangeInfos ): NormalizedChangeInfos
{
    return {
        address: typeof change.address === "string" ? Address.fromString( change.address ) : change.address.clone(),
        datum: change.datum ? (
            canBeHash32( change.datum ) ?
            new Hash32( change.datum ) :
            forceData( change.datum )
        ):
        undefined,
        refScript: change.refScript ? change.refScript.clone() : undefined
    };
}

export function cloneChangeInfos( change: ChangeInfos ): ChangeInfos
{
    return {
        address: change.address.toString() as AddressStr,
        datum: change.datum ? (
            canBeHash32( change.datum ) ?
            new Hash32( change.datum ) :
            cloneCanBeData( change.datum )
        ):
        undefined,
        refScript: change.refScript ? change.refScript.clone() : undefined
    };
}