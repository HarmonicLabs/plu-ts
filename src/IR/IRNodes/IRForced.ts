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

export interface IRForcedMetadata extends BaseIRMetadata {}

export class IRForced
    implements Cloneable<IRForced>, IHash, IIRParent, ToJson
{
    readonly meta: IRForcedMetadata

    constructor( forced: IRTerm, _unsafeHash?: IRHash )
    {
        this.meta = {};

        this._hash = isIRHash( _unsafeHash ) ? _unsafeHash : undefined;
        
        if( !isIRTerm( forced ) )
        throw new Error("IRForced argument was not an IRTerm");

        this._forced = forced;
        this._forced.parent = this;

        this._parent = undefined;
    }

    private _forced!: IRTerm;
    get forced(): IRTerm { return this._forced; }
    set forced( newForced: IRTerm | undefined )
    {
        if(!isIRTerm( newForced ))
        {
            throw new BasePlutsError(
                "invalid IRTerm to be forced"
            );
        }
        if( !shallowEqualIRTermHash(this._forced, newForced) )
        this.markHashAsInvalid();
        
        // keep the parent reference in the old child, useful for compilation
        // _forced.parent = undefined;
        
        this._forced = newForced;
        this._forced.parent = this;
    }

    private _hash: IRHash | undefined;
    get hash(): IRHash
    {
        if(!isIRHash( this._hash ))
        {
            this._hash = hashIrData(
                concatUint8Arr(
                    IRForced.tag,
                    this._forced.hash
                )
            );
        }
        return this._hash;
    }
    isHashPresent(): boolean { return isIRHash( this._hash ); }
    markHashAsInvalid(): void
    {
        this._hash = undefined;
        this.parent?.markHashAsInvalid();
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

    static get kind(): IRNodeKind.Forced { return IRNodeKind.Forced; }
    get kind(): IRNodeKind.Forced { return IRForced.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRForced.kind ]); }

    clone(): IRForced
    {
        return new IRForced(
            this.forced.clone(),
            this.isHashPresent() ? this.hash : undefined
        );
    }
    toJSON() { return this.toJson(); }
    toJson(): any
    {
        return {
            type: "IRForced",
            forced: this.forced.toJson()
        };
    }
}