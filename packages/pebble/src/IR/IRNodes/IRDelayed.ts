import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
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
import { equalIrHash, hashIrData, IRHash, isIRHash } from "../IRHash";
import { shallowEqualIRTermHash } from "../utils/equalIRTerm";
import { IRNodeKind } from "../IRNodeKind";

export interface IRDelayedMetadata extends BaseIRMetadata {}

export class IRDelayed
    implements Cloneable<IRDelayed>, IHash, IIRParent, ToJson
{
    readonly meta: IRDelayedMetadata = {};

    constructor( delayed: IRTerm, _unsafeHash?: IRHash )
    {
        if( !isIRTerm( delayed ) )
        throw new Error("IRDelayed argument was not an IRTerm");
        
        this._delayed = delayed;
        this._delayed.parent = this;
        
        this._hash = isIRHash( _unsafeHash ) ? _unsafeHash : undefined;

        this._parent = undefined;
    }

    static get kind(): IRNodeKind.Delayed { return IRNodeKind.Delayed; }
    get kind(): IRNodeKind.Delayed { return IRDelayed.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRDelayed.kind ]); }

    private _delayed!: IRTerm
    get delayed(): IRTerm { return this._delayed }
    set delayed( newDelayed: IRTerm | undefined)
    {
        if(!isIRTerm( newDelayed ))
        {
            throw new BasePlutsError(
                "invalid IRTerm to be delayed"
            );
        }
        if(!shallowEqualIRTermHash(this._delayed, newDelayed))
        this.markHashAsInvalid();
        
        // keep the parent reference in the old child, useful for compilation
        // _delayed.parent = undefined;
        
        this._delayed = newDelayed;
        this._delayed.parent = this;
    }

    private _hash: IRHash | undefined;
    get hash(): IRHash
    {
        if(!isIRHash( this._hash ))
        {
            this._hash = hashIrData(
                concatUint8Arr(
                    IRDelayed.tag,
                    this.delayed.hash
                )
            );
        }
        return this._hash;
    }

    private _parent: IRParentTerm | undefined;
    get parent(): IRParentTerm | undefined { return this._parent }
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

        this._parent = newParent;
    }
    isHashPresent(): boolean { return isIRHash( this._hash ) }
    markHashAsInvalid(): void
    {
        this._hash = undefined;
        this._parent?.markHashAsInvalid();
    }

    clone(): IRDelayed
    {
        return new IRDelayed(
            this.delayed.clone(),
            this.isHashPresent() ? this.hash : undefined
        )
    }
    toJSON() { return this.toJson(); }
    toJson(): any
    {
        return {
            type: "IRDelayed",
            delayed: this.delayed.toJson()
        }
    }
}