import { CborObj } from "../../cbor/CborObj";
import { CanBeCborString } from "../../cbor/CborString";
import { blake2b_224 } from "../../crypto";
import ObjectUtils from "../../utils/ObjectUtils";
import { Hash32 } from "../hashes/Hash32/Hash32";
import { PubKeyHash } from "./PubKeyHash";

export class PublicKey extends Hash32
{
    readonly hash!: PubKeyHash;

    constructor( pubKey: string | Buffer | Hash32 )
    {
        super( pubKey, "PublicKey" );

        let _hash: PubKeyHash | undefined = undefined;
        ObjectUtils.definePropertyIfNotPresent(
            this, "hash",
            {
                get: () => {
                    if( _hash !== undefined && _hash instanceof PubKeyHash ) return _hash.clone();

                    _hash = new PubKeyHash(
                        Buffer.from(
                            blake2b_224(
                                this.asBytes
                            )
                        )
                    );

                    return _hash.clone();
                },
                set: () => {},
                configurable: false,
                enumerable: true
            }
        );
        
    }

    static fromCbor(cStr: CanBeCborString)
    {
        return new PublicKey( Hash32.fromCbor( cStr ).asBytes )
    }
    static fromCborObj( cObj: CborObj )
    {
        return new PublicKey( Hash32.fromCborObj( cObj ).asBytes )
    }
}