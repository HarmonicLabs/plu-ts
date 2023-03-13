import { blake2b_224 } from "../../../crypto";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";

export class IRForced
    implements Cloneable<IRForced>, IHash
{
    readonly forced!: IRTerm
    readonly hash!: Uint8Array

    constructor( forced: IRTerm )
    {
        if(!isIRTerm( forced ))
        {
            throw new BasePlutsError(
                "invalid IRTerm to be forced"
            );
        }
        ObjectUtils.defineReadOnlyProperty(
            this, "forced", forced
        );

        let hash: Uint8Array | undefined = undefined
        Object.defineProperty(
            this, "hash",
            {
                get: () => {
                    if(!(hash instanceof Uint8Array))
                    {
                        hash = blake2b_224(
                            concatUint8Arr(
                                IRForced.tag,
                                this.forced.hash
                            )
                        );
                    }
                    return hash.slice();
                }
            }
        )
    }

    static get tag(): Uint8Array
    {
        return new Uint8Array([0b0000_1000]);
    }

    clone(): IRForced
    {
        return new IRForced( this.forced.clone() )
    }
}