import { blake2b_224 } from "../../../crypto";
import { UnexpectedMarkHashInvalidCall } from "../../../errors/PlutsIRError/UnexpectedMarkHashInvalidCall";
import { BitStream } from "../../../types/bits/BitStream";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import { ToJson } from "../../../utils/ts/ToJson";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { isIRTerm } from "../utils/isIRTerm";

const irErrorBitTag = new Uint8Array([ 0b0000_0111 ]);
const errorHash = blake2b_224( irErrorBitTag.slice() )

export class IRError
    implements Cloneable<IRError>, IHash, IIRParent, ToJson
{
    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;

    parent: IRTerm | undefined;

    constructor( irParent?: IRTerm )
    {
        let _parent: IRTerm | undefined = undefined;
        Object.defineProperty(
            this, "parent",
            {
                get: () => _parent,
                set: ( newParent: IRTerm | undefined ) => {

                    if( newParent === undefined || isIRTerm( newParent ) )
                    {
                        _parent = newParent;
                    }

                },
                enumerable: true,
                configurable: false
            }
        );
        this.parent = irParent;

        Object.defineProperty(
            this, "hash", {
                get: () => errorHash.slice(),
                set: () => {},
                enumerable: true,
                configurable: false,
            }
        );
        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => { throw new UnexpectedMarkHashInvalidCall("IRError") },
                writable: false,
                enumerable:  true,
                configurable: false
            }
        );
    }

    static get tag(): Uint8Array { return irErrorBitTag.slice(); }

    clone(): IRError
    {
        return new IRError()
    }

    toJson()
    {
        return {
            type: "IRError"
        }
    }
};

