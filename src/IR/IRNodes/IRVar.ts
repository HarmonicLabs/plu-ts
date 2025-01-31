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

export interface IRVarMetadata extends BaseIRMetadata {}

export class IRVar
    implements Cloneable<IRVar>, IHash, IIRParent, ToJson
{
    private _hash: IRHash | undefined;
    get hash(): IRHash
    {
        if(!isIRHash( this._hash ))
        {
            this._hash = getVarHashAtDbn( this.dbn );
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
     * this is because in the IR things like `IRLetted` and `IRHoisted`
     * are skipping some DeBruijin levels that are instead present
     * in the final UPLC
    **/
    get dbn(): number { return this._dbn; }
    set dbn( newDbn: number )
    {
        if(!(
            Number.isSafeInteger( newDbn ) && newDbn >= 0 
        )){
            // console.log( e.stack );
            throw new BasePlutsError(
                "invalid index for an `IRVar` instance; new DeBruijn was: " + newDbn
            );
        }

        if( newDbn === this._dbn ) return; // everything ok

        this.markHashAsInvalid();
        this._dbn = newDbn;
    }

    static get kind(): IRNodeKind.Var { return IRNodeKind.Var; }
    get kind(): IRNodeKind.Var { return IRVar.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRVar.kind ]); }

    readonly meta: IRVarMetadata

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

    clone(): IRVar
    {
        return new IRVar( this.dbn );
    }
    toJSON() { return this.toJson(); }
    toJson(): any
    {
        return {
            type: "IRVar",
            dbn: this.dbn
        }
    }
}

const bdnVarHashCache: IRHash[] = []; 

function getVarHashAtDbn( dbn: number )
{
    while( (bdnVarHashCache.length - 1) < dbn )
    {
        bdnVarHashCache.push(
            hashIrData(
                concatUint8Arr(
                    IRVar.tag,
                    positiveIntAsBytes( bdnVarHashCache.length )
                )
            )
        );
    }

    return bdnVarHashCache[ dbn ];
}