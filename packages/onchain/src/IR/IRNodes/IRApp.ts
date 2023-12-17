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

    parent: IRParentTerm | undefined;

    readonly meta: IRAppMeta

    constructor( _fn_: IRTerm, _arg_: IRTerm, meta: IRAppMeta = {} )
    {
        if( !isIRTerm( _fn_ ) )
        {
            throw new Error(
                "invalidn function node for `IRApp`"
            );
        }

        if( !isIRTerm( _arg_ ) )
        {
            throw new Error(
                "invalidn function node for `IRApp`"
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

        let hash: Uint8Array | undefined = undefined;
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
                    if( !isIRTerm( newArg ) ) return;

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

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0010 ]); }

    clone(): IRApp
    {
        return new IRApp(
            this.fn.clone(),
            this.arg.clone(),
            { ...this.meta }
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