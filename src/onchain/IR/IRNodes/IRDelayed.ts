import { blake2b_224 } from "../../../crypto";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import { ToJson } from "../../../utils/ts/ToJson";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";

export class IRDelayed
    implements Cloneable<IRDelayed>, IHash, IIRParent, ToJson
{
    delayed!: IRTerm
    readonly hash!: Uint8Array
    markHashAsInvalid!: () => void;

    parent: IRTerm | undefined;

    constructor( delayed: IRTerm, irParent?: IRTerm )
    {
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
        );

        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => { 
                    hash = undefined;
                    this.parent?.markHashAsInvalid()
                },
                writable: false,
                enumerable:  false,
                configurable: false
            }
        );

        let _delayed: IRTerm;
        Object.defineProperty(
            this, "delayed",
            {
                get: () => _delayed,
                set: ( newDelayed: IRTerm | undefined ) => {
                    if(!isIRTerm( newDelayed ))
                    {
                        throw new BasePlutsError(
                            "invalid IRTerm to be delayed"
                        );
                    }
                    this.markHashAsInvalid();
                    _delayed = newDelayed;
                    _delayed.parent = this;
                },
                enumerable: true,
                configurable: false
            }
        );
        this.delayed = delayed;

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

    }

    static get tag(): Uint8Array
    {
        return new Uint8Array([0b0000_1001]);
    }

    clone(): IRDelayed
    {
        return new IRDelayed( this.delayed.clone() )
    }

    toJson(): any
    {
        return {
            type: "IRDelayed",
            delayed: this.delayed.toJson()
        }
    }
}