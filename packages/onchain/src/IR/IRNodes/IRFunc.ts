import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { blake2b_128 } from "@harmoniclabs/crypto";
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

export interface IRFuncMetadata extends BaseIRMetadata {}

export class IRFunc
    implements Cloneable<IRFunc>, IHash, IIRParent, ToJson
{
    readonly arity!: number;

    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;

    readonly meta: IRFuncMetadata

    get name(): string | undefined { return this.meta.name };

    body!: IRTerm

    parent: IRTerm | undefined;

    clone!: () => IRFunc;

    constructor(
        arity: number,
        body: IRTerm,
        func_name?: string | undefined
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

        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = blake2b_128(
                            concatUint8Arr(
                                IRFunc.tag,
                                positiveIntAsBytes( this.arity ),
                                _body.hash
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
                    
                    this.markHashAsInvalid();
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

        Object.defineProperty(
            this, "clone",
            {
                value: () => {
                    return new IRFunc(
                        this.arity,
                        body.clone()
                    )
                },
                writable: false,
                enumerable: true,
                configurable: false
            }
        );
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_00001 ]); }

    toJson(): any
    {
        return {
            type: "IRFunc",
            arity: this.arity,
            body: this.body.toJson()
        }
    }
}
