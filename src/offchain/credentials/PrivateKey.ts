import { CborObj } from "../../cbor/CborObj";
import { CanBeCborString } from "../../cbor/CborString";
import { Hash32 } from "../hashes/Hash32/Hash32";

export class PrivateKey extends Hash32
{
    static fromCbor(cStr: CanBeCborString)
    {
        return new PrivateKey( Hash32.fromCbor( cStr ).asBytes )
    }
    static fromCborObj( cObj: CborObj )
    {
        return new PrivateKey( Hash32.fromCborObj( cObj ).asBytes )
    }
}