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

    readonly meta: IRDelayedMetadata

    parent: IRParentTerm | undefined;

    constructor( delayed: IRTerm )
    {
        Object.defineProperty(
            this, "meta", {
                value: {},
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

        let hash: Uint8Array | undefined = undefined
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
                    if(
                        (
                            newParent === undefined || 
                            isIRParentTerm( newParent )
                        ) &&
                        _parent !== newParent
                    )
                    {
                        if( isIRParentTerm( _parent ) ) _modifyChildFromTo(
                            _parent,
                            this,
                            this.clone()
                        );
                        _parent = newParent;
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