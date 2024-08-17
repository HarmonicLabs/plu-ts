import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { BasePlutsError } from "../../utils/BasePlutsError";
import { ToJson } from "../../utils/ToJson";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";
import { equalIrHash, hashIrData, IRHash, isIRHash } from "../IRHash";

export interface IRFuncMetadata extends BaseIRMetadata {}

export class IRFunc
    implements Cloneable<IRFunc>, IHash, IIRParent, ToJson
{
    readonly arity!: number;

    readonly hash!: IRHash;
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;

    readonly meta: IRFuncMetadata

    get name(): string | undefined { return this.meta.name };

    body!: IRTerm

    parent: IRTerm | undefined;

    constructor(
        arity: number,
        body: IRTerm,
        func_name?: string | undefined,
        _unsafeHash?: IRHash
    )
    {
        if( !Number.isSafeInteger( arity ) && arity >= 1 )
        throw new BasePlutsError(
            "invalid arity for 'IRFunc'"
        )

        if( !isIRTerm( body ) )
        throw new Error("IRFunc body argument was not an IRTerm");

        Object.defineProperties(
            this, {
                arity: {
                    value: arity,
                    writable: false,
                    enumerable: true,
                    configurable: false
                },
                meta: {
                    value: {
                        name: typeof func_name === "string" ? func_name : (void 0)
                    },
                    writable: true,
                    enumerable: true,
                    configurable: false
                }
            }
        );

        let _body: IRTerm = body;
        _body.parent = this;

        let hash: IRHash | undefined = isIRHash( _unsafeHash ) ? _unsafeHash : undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!isIRHash( hash ))
                    {
                        hash = hashIrData(
                            concatUint8Arr(
                                IRFunc.tag,
                                positiveIntAsBytes( this.arity ),
                                _body.hash
                            )
                        )
                    }
                    return hash;
                },
                set: () => {},
                enumerable: true,
                configurable: false
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

        Object.defineProperty(
            this, "body", {
                get: () => _body,
                set: ( newBody: IRTerm ) => {
                    if(!isIRTerm( newBody ))
                    {
                        throw new BasePlutsError(
                            "invalid IRTerm to be a function body"
                        );
                    }
                    
                    if(!equalIrHash(_body.hash, newBody.hash)) this.markHashAsInvalid();
                    // keep the parent reference in the old child, useful for compilation
                    // _body.parent = undefined;
                    _body = newBody;
                    _body.parent = this;
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
                    // if( oldParent !== undefined && isIRParentTerm( oldParent ) )
                    // {
                    //     // change reference to a clone for safety
                    //     _modifyChildFromTo(
                    //         oldParent,
                    //         this,
                    //         this.clone()
                    //     );
                    // }
                },
                enumerable: true,
                configurable: false
            }
        );

    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_00001 ]); }

    clone(): IRFunc
    {
        return new IRFunc(
            this.arity,
            this.body.clone(),
            this.meta.name,
            this.isHashPresent() ? this.hash : undefined
        )
    }

    toJson(): any
    {
        return {
            type: "IRFunc",
            arity: this.arity,
            body: this.body.toJson()
        }
    }
}
