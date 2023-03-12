import { seahash } from "../../../crypto";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { concatUint8Arr } from "../utils/concatUint8Arr";

export class IRLetted
    implements Cloneable<IRLetted>, IHash
{
    readonly hash!: Uint8Array;

    readonly value!: IRTerm

    clone!: () => IRLetted

    constructor( value: IRTerm, dependencies: IRLetted[] = [] )
    {
        ObjectUtils.defineReadOnlyProperty(
            this, "value", value
        );

        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = seahash(
                            concatUint8Arr(
                                IRLetted.tag,
                                value.hash
                            )
                        )
                    }
                    return hash.slice();
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        const deps = dependencies // TODO


        ObjectUtils.defineReadOnlyProperty(
            this, "clone",
            () => {
                return new IRLetted( this.value.clone(), deps.slice() )
            }
        )
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0101 ]); }

}