import { Address, AddressStr } from "@harmoniclabs/cardano-ledger-ts";

export function forceAddr( addr: Address | AddressStr ): Address
{
    return addr instanceof Address ? addr : Address.fromString( addr );
}