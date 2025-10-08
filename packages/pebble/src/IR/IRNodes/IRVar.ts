import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { BasePlutsError } from "../../utils/BasePlutsError";
import { ToJson } from "../../utils/ToJson";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";
import { hashIrData, IRHash, isIRHash } from "../IRHash";
import { IRNodeKind } from "../IRNodeKind";
import { IIRTerm, IRTerm } from "../IRTerm";
import { fromUtf8 } from "@harmoniclabs/uint8array-utils";

export interface IRVarMetadata extends BaseIRMetadata {}

export class IRVar
    implements IIRTerm, Cloneable<IRVar>, IHash, IIRParent, ToJson
{
    readonly meta: IRVarMetadata
    readonly name: string;

    constructor( name: string )
    {
        if(!(
            typeof name === "string"
            && name.length > 0
        )) throw new BasePlutsError("invalid name for IRVar");
        this.name = name;

        this.meta = {};
        
        this._hash = undefined;
        this._parent = undefined;
    }

    private _hash: IRHash | undefined;
    get hash(): IRHash
    {
        if(!isIRHash( this._hash ))
        {
            this._hash = hashIrData(
                concatUint8Arr(
                    IRVar.tag,
                    fromUtf8( this.name )
                )
            );
        }
        return this._hash;
    }
    /**
     * called inside the dbn setter
     */
    markHashAsInvalid(): void
    {
        this._hash = undefined;
        this.parent?.markHashAsInvalid();
    }
    isHashPresent(): true { return true; }
    
    static get kind(): IRNodeKind.Var { return IRNodeKind.Var; }
    get kind(): IRNodeKind.Var { return IRVar.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRVar.kind ]); }

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

    children(): IRTerm[] { return []; }

    clone(): IRVar
    {
        return new IRVar( this.name );
    }
    toJSON() { return this.toJson(); }
    toJson(): any
    {
        return {
            type: "IRVar",
            name: this.name
        }
    }
}