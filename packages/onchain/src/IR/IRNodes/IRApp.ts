import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { ToJson } from "../../utils/ToJson";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { blake2b_128 } from "@harmoniclabs/crypto";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";

export interface IRAppMeta extends BaseIRMetadata {
    __src__?: string | undefined
}

export class IRApp
    implements Cloneable<IRApp>, IHash, IIRParent, ToJson
{
    fn!: IRTerm;
    arg!: IRTerm;

    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;

    parent: IRParentTerm | undefined;

    readonly meta: IRAppMeta

    constructor(
        _fn_: IRTerm,
        _arg_: IRTerm,
        meta: IRAppMeta = {},
        _unsafeHash?: Uint8Array
    )
    {
        if( !isIRTerm( _fn_ ) )
        {
            throw new Error(
                "invalid function node for `IRApp`"
            );
        }

        if( !isIRTerm( _arg_ ) )
        {
            throw new Error(
                "invalid argument node for `IRApp`"
            );
        }

        Object.defineProperty(
            this, "meta", {
                value: { ...meta },
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

        let fn: IRTerm = _fn_;
        let arg: IRTerm = _arg_;
        fn.parent = this;
        arg.parent = this;

        let hash: Uint8Array | undefined = _unsafeHash;
        Object.defineProperty(
            this, "hash",
            {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        // basically a merkle tree
                        hash = blake2b_128( concatUint8Arr( IRApp.tag, fn.hash, arg.hash ) );
                    }
                    // return a copy
                    return hash.slice()
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
            this, "fn", {
                get: () => fn,
                set: ( newFn: any ) => {
                    if( !isIRTerm( newFn ) ) return;
                    
                    this.markHashAsInvalid();
                    fn = newFn;
                    fn.parent = this;
                },
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "arg", {
                get: () => arg,
                set: ( newArg: any ) => {
                    if( !isIRTerm( newArg ) ) return newArg;

                    this.markHashAsInvalid();
                    arg = newArg;
                    arg.parent = this;
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

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0010 ]); }

    clone(): IRApp
    {
        return new IRApp(
            this.fn.clone(),
            this.arg.clone(),
            { ...this.meta },
            this.isHashPresent() ? this.hash : undefined
        );
    }

    toJson(): any
    {
        return {
            type: "IRApp",
            fn: this.fn.toJson(),
            arg: this.arg.toJson()
        }
    }
}