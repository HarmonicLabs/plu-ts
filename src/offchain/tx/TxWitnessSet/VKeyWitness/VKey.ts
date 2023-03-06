import { blake2b_224 } from "../../../../crypto";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { PubKeyHash } from "../../../credentials/PubKeyHash";
import { Hash32 } from "../../../hashes/Hash32/Hash32";

export class VKey extends Hash32
{
    /**
     * getter
     */
    readonly hash!: PubKeyHash

    constructor( bs: string | Uint8Array | Hash32 )
    {
        super( bs , "VKey" );

        let _hash: PubKeyHash = undefined as any;
        ObjectUtils.definePropertyIfNotPresent(
            this, "hash",
            {
                get: () => {
                    if( _hash instanceof PubKeyHash ) return _hash.clone();

                    _hash = new PubKeyHash(
                        Uint8Array.from(
                            blake2b_224( this.asBytes )
                        )
                    );

                    return _hash.clone();
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        
    }
};