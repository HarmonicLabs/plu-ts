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
import { IRRecursive } from "./IRRecursive";
import { IIRTerm, IRTerm } from "../IRTerm";
import { IRFunc } from "./IRFunc";
import { fromUtf8 } from "@harmoniclabs/uint8array-utils";

export interface IRSelfCallMetadata extends BaseIRMetadata {}

export class IRSelfCall
    implements IIRTerm, Cloneable<IRSelfCall>, IHash, IIRParent, ToJson
{
    readonly name: string;
    readonly meta: IRSelfCallMetadata;

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
                    IRSelfCall.tag,
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
    
    static get kind(): IRNodeKind.SelfCall { return IRNodeKind.SelfCall; }
    get kind(): IRNodeKind.SelfCall { return IRSelfCall.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRSelfCall.kind ]); }

    private _definition: IRRecursive | undefined;
    get definition(): IRRecursive
    {
        if(!( this._definition instanceof IRRecursive ))
        {
            this._definition = this._findDefinition();
        }
        return this._definition;
    }
    set definition( newDefinition: IRRecursive | undefined )
    {
        if( newDefinition === undefined )
        {
            this._definition = undefined;
            return;
        }
        else throw new Error(
            "IRSelfCall definition (IRRecursive parent) can't be changed unless set to undefined"
        );
    }

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

        // if we change parent, _definition should be recalculated
        this._definition = undefined;
    }

    private _findDefinition(): IRRecursive
    {
        let node: IRTerm | undefined = this;
        let dbn = this.dbn;
        while( node.parent !== undefined )
        {
            node = node.parent;
            if(
                node instanceof IRRecursive ||
                node instanceof IRFunc
            )
            {
                if( dbn === 0 )
                {
                    if( node.parent instanceof IRRecursive ) return node.parent;
                    else throw new Error(
                        "IRSelfCall was pointing to a IRFunc node"
                    );
                }
                dbn -= node.arity;
            }
        }
        throw new Error(
            "IRSelfCall instance was not inside a IRRecursive instance"
        );
    }

    children(): IRTerm[] { return []; }

    clone(): IRSelfCall
    {
        return new IRSelfCall( this.name );
    }
    toJSON() { return this.toJson(); }
    toJson(): any
    {
        return {
            type: "IRSelfCall",
            name: this.name
        }
    }
}