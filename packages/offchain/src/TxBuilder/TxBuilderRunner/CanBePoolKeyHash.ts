import { Hash28, PoolKeyHash, Address, AddressStr } from "@harmoniclabs/cardano-ledger-ts";
import { decodeBech32 } from "@harmoniclabs/crypto";
import { fromHex } from "@harmoniclabs/uint8array-utils";

export type CanBePoolKeyHash = Hash28 | `pool1${string}` | `pool_test1${string}` | string /* hex */ | Uint8Array;

export function forcePoolKeyHash( canBe: CanBePoolKeyHash ): PoolKeyHash
{
    if( typeof canBe === "string" )
    {
        if( canBe.startsWith("pool") )
        {
            const [ _hrp, decoded ] = decodeBech32( canBe );

            return new PoolKeyHash( new Uint8Array( decoded ) );
        }
        return new PoolKeyHash( fromHex( canBe ) );
    }
    return new PoolKeyHash( canBe );
}