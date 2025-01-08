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
import { IRTerm } from "../IRTerm";
import { IRFunc } from ".";

export interface IRSelfCallMetadata extends BaseIRMetadata {}

export class IRSelfCall
    implements Cloneable<IRSelfCall>, IHash, IIRParent, ToJson
{
    private _hash: IRHash | undefined;
    get hash(): IRHash
    {
        if(!isIRHash( this._hash ))
        {
            this._hash = getSelfCallHashAtDbn( this.dbn );
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
    
    private _dbn: number;
    /**
     * the IR DeBruijn index is not necessarly the same of the UPLC
     * ( more ofthen than not it won't be the same )
     * 
     * this is because in the IR things like `plet`
     * are skipping some DeBruijin levels that are instead present
     * in the final UPLC
    **/
    get dbn(): number { return this._dbn; }
    set dbn( newDbn: number )
    {
        if(!(
            Number.isSafeInteger( newDbn ) && newDbn >= 0 
        )){
            throw new BasePlutsError(
                "invalid index for an `IRSelfCall` instance; new DeBruijn was: " + newDbn
            );
        }

        if( newDbn === this._dbn ) return; // everything ok

        this.markHashAsInvalid();
        this._dbn = newDbn;
    }

    static get kind(): IRNodeKind.SelfCall { return IRNodeKind.SelfCall; }
    get kind(): IRNodeKind.SelfCall { return IRSelfCall.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRSelfCall.kind ]); }

    readonly meta: IRSelfCallMetadata

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

    constructor( DeBruijn: number | bigint )
    {

        Object.defineProperty(
            this, "meta", {
                value: {},
                writable: false,
                enumerable: true,
                configurable: false
            }
        );
        
        this._hash = undefined;

        DeBruijn = typeof DeBruijn === "number" ? DeBruijn : Number( DeBruijn );
        this._dbn = DeBruijn;
        // call setter to check for validity
        this.dbn = DeBruijn;
        
        this._parent = undefined;
    }

    clone(): IRSelfCall
    {
        return new IRSelfCall( this.dbn );
    }
    toJSON() { return this.toJson(); }
    toJson(): any
    {
        return {
            type: "IRSelfCall",
            dbn: this.dbn
        }
    }
}

const dbnSelfCallCache: { [dbn: number]: IRHash } = {};

function getSelfCallHashAtDbn( dbn: number )
{
    if( !isIRHash( dbnSelfCallCache[dbn] ) )
    {
        dbnSelfCallCache[dbn] = (
            hashIrData(
                concatUint8Arr(
                    IRSelfCall.tag,
                    positiveIntAsBytes( dbn )
                )
            )
        );
    }

    return dbnSelfCallCache[ dbn ];
}