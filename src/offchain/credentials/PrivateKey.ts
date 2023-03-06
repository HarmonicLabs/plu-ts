import { CborObj } from "../../cbor/CborObj";
import { CanBeCborString } from "../../cbor/CborString";
import { byte, deriveEd25519PublicKey } from "../../crypto";
import { Hash32 } from "../hashes/Hash32/Hash32";
import { PublicKey } from "./PublicKey";

export class PrivateKey extends Hash32
{
    derivePublicKey(): PublicKey
    {
        return new PublicKey(
            new Uint8Array(
                deriveEd25519PublicKey(
                    Array.from( this.asBytes ) as byte[]
                )
            )
        );
    }

    static fromCbor(cStr: CanBeCborString)
    {
        return new PrivateKey( Hash32.fromCbor( cStr ).asBytes )
    }
    static fromCborObj( cObj: CborObj )
    {
        return new PrivateKey( Hash32.fromCborObj( cObj ).asBytes )
    }
}