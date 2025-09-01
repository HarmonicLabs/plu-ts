import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { ToJson } from "../../utils/ToJson";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";
import { equalIrHash, hashIrData, IRHash, isIRHash } from "../IRHash";
import { isObject } from "@harmoniclabs/obj-utils";
import { shallowEqualIRTermHash } from "../utils/equalIRTerm";
import { IRNodeKind } from "../IRNodeKind";

export interface IRAppMeta extends BaseIRMetadata {
    __src__?: string | undefined
}

export class IRApp
    implements Cloneable<IRApp>, IHash, IIRParent, ToJson
{
    constructor(
        _fn_: IRTerm,
        _arg_: IRTerm,
        meta: IRAppMeta | undefined = undefined,
        _unsafeHash?: IRHash
    )
    {
        if( !isIRTerm( _fn_ ) )
        throw new Error(
            "invalid function node for `IRApp`"
        );
        if( !isIRTerm( _arg_ ) )
        throw new Error(
            "invalid argument node for `IRApp`"
        );

        this._meta = meta;
        
        this._fn = _fn_;
        this._arg = _arg_;

        this._fn.parent = this;
        this._arg.parent = this;

        this._hash = isIRHash( _unsafeHash ) ? _unsafeHash : undefined;
    }

    static get kind(): IRNodeKind { return IRNodeKind.App; }
    get kind(): IRNodeKind { return IRApp.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRApp.kind ]); }

    private _fn!: IRTerm;
    get fn(): IRTerm { return this._fn; }
    set fn( newFn: IRTerm ) {
        if( !isIRTerm( newFn ) ) return;
                    
        if(!shallowEqualIRTermHash( this._fn, newFn ))
        this.markHashAsInvalid();

        // keep the parent reference in the old child, useful for compilation
        // fn.parent = undefined;
        this._fn = newFn;
        this._fn.parent = this;
    }

    private _arg!: IRTerm;
    get arg(): IRTerm { return this._arg; }
    set arg( newArg: IRTerm )
    {
        if( !isIRTerm( newArg ) ) return;

        if(!shallowEqualIRTermHash( this._arg, newArg ))
        this.markHashAsInvalid();

        // keep the parent reference in the old child, useful for compilation
        // arg.parent = undefined;
        this._arg = newArg;
        this._arg.parent = this;
    }

    private _hash: IRHash | undefined;
    get hash(): IRHash {
        if(!isIRHash( this._hash ))
        {
            // basically a merkle tree
            this._hash = hashIrData(
                concatUint8Arr(
                    IRApp.tag,
                    this._fn.hash,
                    this._arg.hash
                )
            );
        }
        return this._hash;
    }
    markHashAsInvalid(): void
    {
        this._hash = undefined;
        this.parent?.markHashAsInvalid();
    }
    isHashPresent(): boolean { return isIRHash( this._hash ); }

    private _parent: IRParentTerm | undefined;
    get parent(): IRParentTerm | undefined { return this._parent; }
    set parent( newParent: IRParentTerm | undefined )
    {
        if(!( // assert
            // new parent value is different than current
            this._parent !== newParent && (
                // and the new parent value is valid
                newParent === undefined || 
                isIRParentTerm( newParent )
            )
        )) return;
        
        // change parent
        this._parent = newParent;
    }

    private _meta: IRAppMeta | undefined;
    get meta(): IRAppMeta
    {
        if( !isObject( this._meta ) ) this._meta = {};
        return this._meta!;
    }

    clone(): IRApp
    {
        return new IRApp(
            this.fn.clone(),
            this.arg.clone(),
            isObject( this._meta ) ? { ...this._meta } : undefined,
            this.isHashPresent() ? this.hash : undefined
        );
    }
    toJSON() { return this.toJson(); }
    toJson(): any
    {
        return {
            type: "IRApp",
            fn: this.fn.toJson(),
            arg: this.arg.toJson()
        }
    }
}