import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { ToJson } from "../../utils/ToJson";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";
import { hashIrData, IRHash } from "../IRHash";

const irErrorBitTag = new Uint8Array([ 0b0000_0111 ]);
const errorHash = hashIrData( irErrorBitTag.slice() )

export interface IRErrorMetadata extends BaseIRMetadata {}

export class IRError
    implements Cloneable<IRError>, IHash, IIRParent, ToJson
{
    readonly meta: IRErrorMetadata

    msg?: string
    addInfos?: any

    constructor( msg?: string, addInfos?: any )
    {
        this.msg = msg;
        this.addInfos = addInfos ?? {};
        this.meta = {};
        this._parent = undefined;
    }

    static get tag(): Uint8Array { return irErrorBitTag.slice(); }

    get hash(): IRHash { return errorHash; }
    isHashPresent(): boolean { return true; }
    markHashAsInvalid(): void { throw new Error("IRError.markHashAsInvalid was called but error doesn't have childs") }

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
        
        // keep reference
        const oldParent = this._parent;
        
        // change parent
        this._parent = newParent;

        // if has old parent
        if( oldParent !== undefined && isIRParentTerm( oldParent ) )
        {
            // change reference to a clone for safety
            this.hash;
            _modifyChildFromTo(
                oldParent,
                this,
                this.clone()
            );
        }
    }

    clone(): IRError
    {
        return new IRError( this.msg, { ...this.addInfos } );
    }

    toJson()
    {
        return {
            type: "IRError"
        }
    }
};

