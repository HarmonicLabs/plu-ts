import { CborObj } from "../../cbor/CborObj";
import { CanBeCborString } from "../../cbor/CborString";
import { Hash32 } from "../hashes/Hash32/Hash32";

export class PublicKey extends Hash32
{
    static fromCbor(cStr: CanBeCborString)
    {
        return new PublicKey( Hash32.fromCbor( cStr ).asBytes )
    }
    static fromCborObj( cObj: CborObj )
    {
        return new PublicKey( Hash32.fromCborObj( cObj ).asBytes )
    }
}