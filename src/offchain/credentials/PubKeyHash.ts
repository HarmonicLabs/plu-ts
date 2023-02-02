import CborObj from "../../cbor/CborObj";
import { CanBeCborString } from "../../cbor/CborString";
import Hash28 from "../hashes/Hash28/Hash28";

export default class PubKeyHash extends Hash28
{
    static fromCbor(cStr: CanBeCborString)
    {
        return new PubKeyHash( Hash28.fromCbor( cStr ).asBytes )
    }
    static fromCborObj( cObj: CborObj )
    {
        return new PubKeyHash( Hash28.fromCborObj( cObj ).asBytes )
    }
}