import { Data, isData } from "./Data";
import { blake2b_256 } from "../../crypto";
import { BasePlutsError } from "../../errors/BasePlutsError";
import { dataToCbor } from "./toCbor";
import { Hash32 } from "../../offchain/hashes/Hash32/Hash32";

export function hashData( data: Data ): Hash32
{
    if( !isData( data ) )
    throw new BasePlutsError(
        "hashData only works with Data"
    );

    return new Hash32(
        Buffer.from(
            blake2b_256( dataToCbor( data ).asBytes )
        )
    );
}