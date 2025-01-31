import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { ToJson } from "../../utils/ToJson";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";
import { hashIrData, IRHash } from "../IRHash";
import { IRNodeKind } from "../IRNodeKind";

const irErrorBitTag = new Uint8Array([ IRNodeKind.Error ]);
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

    static get kind(): IRNodeKind.Error { return IRNodeKind.Error; }
    get kind(): IRNodeKind.Error { return IRError.kind; }
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
        
        this._parent = newParent;
    }

    clone(): IRError
    {
        return new IRError( this.msg, { ...this.addInfos } );
    }
    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            type: "IRError"
        }
    }
};

