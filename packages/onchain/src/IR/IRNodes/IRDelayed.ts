import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { blake2b_128 } from "@harmoniclabs/crypto";
import { BasePlutsError } from "../../utils/BasePlutsError";
import { ToJson } from "../../utils/ToJson";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";

export interface IRDelayedMetadata extends BaseIRMetadata {}

export class IRDelayed
    implements Cloneable<IRDelayed>, IHash, IIRParent, ToJson
{
    delayed!: IRTerm
    readonly hash!: Uint8Array
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;

    readonly meta: IRDelayedMetadata

    parent: IRParentTerm | undefined;

    constructor( delayed: IRTerm, _unsafeHash?: Uint8Array )
    {
        Object.defineProperty(
            this, "meta", {
                value: {},
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

        let hash: Uint8Array | undefined = _unsafeHash;
        Object.defineProperty(
            this, "hash",
            {
                get: () => {
                    if(!(hash instanceof Uint8Array))
                    {
                        hash = blake2b_128(
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
            this, "isHashPresent", {
                value: () => hash instanceof Uint8Array,
                writable: false,
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => { 
                    hash = undefined;
                    this.parent?.markHashAsInvalid();
                },
                writable: false,
                enumerable:  false,
                configurable: false
            }
        );

        if( !isIRTerm( delayed ) )
        throw new Error("IRDelayed argument was not an IRTerm");

        let _delayed: IRTerm = delayed;
        _delayed.parent = this;
        
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

        let _parent: IRParentTerm | undefined = undefined;
        Object.defineProperty(
            this, "parent",
            {
                get: () => _parent,
                set: ( newParent: IRParentTerm | undefined ) => {
                    if(!( // assert
                        // new parent value is different than current
                        _parent !== newParent && (
                            // and the new parent value is valid
                            newParent === undefined || 
                            isIRParentTerm( newParent )
                        )
                    )) return;
                    
                    // keep reference
                    const oldParent = _parent;
                    // change parent
                    _parent = newParent;

                    // if has old parent
                    if( oldParent !== undefined && isIRParentTerm( oldParent ) )
                    {
                        // change reference to a clone for safety
                        _modifyChildFromTo(
                            oldParent,
                            this,
                            this.clone()
                        );
                    }
                },
                enumerable: true,
                configurable: false
            }
        );
    }

    static get tag(): Uint8Array
    {
        return new Uint8Array([0b0000_1001]);
    }

    clone(): IRDelayed
    {
        return new IRDelayed(
            this.delayed.clone(),
            this.isHashPresent() ? this.hash : undefined
        )
    }

    toJson(): any
    {
        return {
            type: "IRDelayed",
            delayed: this.delayed.toJson()
        }
    }
}