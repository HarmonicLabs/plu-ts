import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { blake2b_128 } from "@harmoniclabs/crypto";
import { ToJson } from "../../utils/ToJson";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { isIRTerm } from "../utils/isIRTerm";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";

const irErrorBitTag = new Uint8Array([ 0b0000_0111 ]);
const errorHash = blake2b_128( irErrorBitTag.slice() )

export interface IRErrorMetadata extends BaseIRMetadata {}

export class IRError
    implements Cloneable<IRError>, IHash, IIRParent, ToJson
{
    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;

    readonly meta: IRErrorMetadata

    parent: IRParentTerm | undefined;

    msg?: string
    addInfos?: any

    constructor( msg?: string, addInfos?: any )
    {
        this.msg = msg;
        this.addInfos = addInfos ?? {};

        Object.defineProperty(
            this, "meta", {
                value: {},
                writable: false,
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
        
        Object.defineProperty(
            this, "hash", {
                get: () => errorHash.slice(),
                set: () => {},
                enumerable: true,
                configurable: false,
            }
        );
        Object.defineProperty(
            this, "isHashPresent", {
                value: () => true,
                writable: false,
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => { throw new Error("IRError.markHashAsInvalid was called but error doesn't have childs") },
                writable: false,
                enumerable:  true,
                configurable: false
            }
        );
    }

    static get tag(): Uint8Array { return irErrorBitTag.slice(); }

    clone(): IRError
    {
        return new IRError( this.msg, { ...this.addInfos } );
    }

    toJson()
    {
        return {
            type: "IRError"
        }
    }
};

