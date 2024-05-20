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

export interface IRForcedMetadata extends BaseIRMetadata {}

export class IRForced
    implements Cloneable<IRForced>, IHash, IIRParent, ToJson
{
    forced!: IRTerm
    readonly hash!: Uint8Array
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;

    readonly meta: IRForcedMetadata

    parent: IRParentTerm | undefined;

    constructor( forced: IRTerm, _unsafeHash?: Uint8Array )
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
                                IRForced.tag,
                                this.forced.hash
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
        
        if( !isIRTerm( forced ) )
        throw new Error("IRForced argument was not an IRTerm");

        let _forced: IRTerm = forced;
        _forced.parent = this;
        
        Object.defineProperty(
            this, "forced",
            {
                get: () => _forced,
                set: ( newForced: IRTerm | undefined ) => {
                    if(!isIRTerm( newForced ))
                    {
                        throw new BasePlutsError(
                            "invalid IRTerm to be forced"
                        );
                    }
                    this.markHashAsInvalid();
                    _forced = newForced;
                    _forced.parent = this;
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
        return new Uint8Array([0b0000_1000]);
    }

    clone(): IRForced
    {
        return new IRForced(
            this.forced.clone(),
            this.isHashPresent() ? this.hash : undefined
        );
    }

    toJson(): any
    {
        return {
            type: "IRForced",
            forced: this.forced.toJson()
        }
    }
}