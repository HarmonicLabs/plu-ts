import { seahash } from "../../../crypto";
import { BitStream } from "../../../types/bits/BitStream";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import { IHash } from "../interfaces/IHash";

const irErrorBitTag = new Uint8Array([ 0b0000_0111 ]);
const errorHash = seahash( irErrorBitTag.slice() )

export class IRError
    implements Cloneable<IRError>, IHash
{
    readonly hash!: Uint8Array;

    constructor()
    {
        Object.defineProperty(
            this, "hash", {
                get: () => errorHash.slice(),
                set: () => {},
                enumerable: true,
                configurable: false,
            }
        )
    }

    static get tag(): Uint8Array { return irErrorBitTag.slice(); }

    clone(): IRError
    {
        return new IRError()
    }
};

