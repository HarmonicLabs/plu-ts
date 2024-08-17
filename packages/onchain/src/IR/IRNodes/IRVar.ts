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

export interface IRVarMetadata extends BaseIRMetadata {}

export class IRVar
    implements Cloneable<IRVar>, IHash, IIRParent, ToJson
{
    readonly hash: IRHash;
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;
    
    /**
     * the IR DeBruijn index is not necessarly the same of the UPLC
     * ( more ofthen than not it won't be the same )
     * 
     * this is because in the IR things like `plet`
     * are skipping some DeBruijin levels that are instead present
     * in the final UPLC
    **/
    dbn!: number;

    readonly meta: IRVarMetadata

    parent: IRParentTerm | undefined;

    constructor( DeBruijn: number | bigint )
    {
        DeBruijn = typeof DeBruijn === "number" ? DeBruijn : Number( DeBruijn );

        Object.defineProperty(
            this, "meta", {
                value: {},
                writable: false,
                enumerable: true,
                configurable: false
            }
        );
        
        let hash: IRHash | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!isIRHash( hash ))
                    {
                        hash = hashIrData(
                            concatUint8Arr(
                                IRVar.tag,
                                positiveIntAsBytes( this.dbn )
                            )
                        );
                    }
                    return hash;
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "isHashPresent", {
                value: () => isIRHash( hash),
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
                    this.parent?.markHashAsInvalid()
                },
                writable: false,
                enumerable:  false,
                configurable: false
            }
        );

        const e = Error();

        let _dbn: number
        Object.defineProperty(
            this, "dbn",
            {
                get: () => _dbn,
                set: ( newDbn: number ) => {
                    if(!(
                        Number.isSafeInteger( newDbn ) && newDbn >= 0 
                    )){
                        // console.log( e.stack );
                        throw new BasePlutsError(
                            "invalid index for an `IRVar` instance; new DeBruijn was: " + newDbn
                        );
                    }

                    if( newDbn === _dbn ) return; // everything ok

                    this.markHashAsInvalid()
                    _dbn = newDbn;
                },
                enumerable: true,
                configurable: false
            }
        );
        this.dbn = DeBruijn; // call set
        
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
                    // if( oldParent !== undefined && isIRParentTerm( oldParent ) )
                    // {
                    //     // change reference to a clone for safety
                    //     _modifyChildFromTo(
                    //         oldParent,
                    //         this,
                    //         this.clone()
                    //     );
                    // }
                },
                enumerable: true,
                configurable: false
            }
        );
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0000 ]); }

    clone(): IRVar
    {
        return new IRVar( this.dbn );
    }

    toJson(): any
    {
        return {
            type: "IRVar",
            dbn: this.dbn
        }
    }
}