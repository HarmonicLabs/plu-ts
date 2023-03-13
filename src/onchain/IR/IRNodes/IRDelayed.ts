import { blake2b_224 } from "../../../crypto";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";

export class IRDelayed
    implements Cloneable<IRDelayed>, IHash
{
    readonly delayed!: IRTerm
    readonly hash!: Uint8Array

    constructor( delayed: IRTerm )
    {
        if(!isIRTerm( delayed ))
        {
            throw new BasePlutsError(
                "invalid IRTerm to be delayed"
            );
        }
        ObjectUtils.defineReadOnlyProperty(
            this, "delayed", delayed
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
                                IRDelayed.tag,
                                this.delayed.hash
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
        return new Uint8Array([0b0000_1001]);
    }

    clone(): IRDelayed
    {
        return new IRDelayed( this.delayed.clone() )
    }
}