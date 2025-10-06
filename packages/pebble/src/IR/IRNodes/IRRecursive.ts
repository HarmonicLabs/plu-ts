import { BasePlutsError } from "../../utils/BasePlutsError";
import { Cloneable } from "../../utils/Cloneable";
import { ToJson } from "../../utils/ToJson";
import { IHash, IIRParent } from "../interfaces";
import { IRHash, isIRHash, hashIrData, irHashToBytes } from "../IRHash";
import { IRNodeKind } from "../IRNodeKind";
import { IIRTerm, IRTerm } from "../IRTerm";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { shallowEqualIRTermHash } from "../utils/equalIRTerm";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { isIRTerm } from "../utils/isIRTerm";
import { BaseIRMetadata } from "./BaseIRMetadata";

export interface IRRecursiveMetadata extends BaseIRMetadata {}

export class IRRecursive
    implements IIRTerm, Cloneable<IRRecursive>, IHash, IIRParent, ToJson
{
    static get kind(): IRNodeKind.Recursive { return IRNodeKind.Recursive; }
    get kind(): IRNodeKind.Recursive { return IRRecursive.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRRecursive.kind ]); }

    readonly arity!: number;

    constructor(
        body: IRTerm,
        func_name?: string | undefined,
        _unsafeHash?: IRHash
    ) {
        if( !isIRTerm( body ) )
        throw new Error("IRRecursive body argument was not an IRTerm");

        this.arity = 1;
        this.meta = {
            name: typeof func_name === "string" ? func_name : (void 0)
        };

        this._body = body;
        this._body.parent = this;

        this._hash = isIRHash( _unsafeHash ) ? _unsafeHash : undefined;
        
        this._parent = undefined;
    }

    children(): IRTerm[] {
        return [ this._body ];
    }

    private _body!: IRTerm
    get body(): IRTerm { return this._body }
    set body( newBody: IRTerm )
    {
        if(!isIRTerm( newBody ))
        {
            throw new BasePlutsError(
                "invalid IRTerm to be a function body"
            );
        }
        
        if(!shallowEqualIRTermHash(this._body, newBody))
        this.markHashAsInvalid();
        // keep the parent reference in the old child, useful for compilation
        // _body.parent = undefined;
        this._body = newBody;
        this._body.parent = this;
    }

    private _hash: IRHash | undefined;
    get hash(): IRHash
    {
        if(!isIRHash( this._hash ))
        {
            this._hash = hashIrData(
                concatUint8Arr(
                    IRRecursive.tag,
                    // positiveIntAsBytes( this.arity ),
                    irHashToBytes( this._body.hash )
                )
            );
        }
        return this._hash;
    }
    isHashPresent(): boolean { return isIRHash( this._hash ) }
    markHashAsInvalid(): void
    {
        this._hash = undefined;
        this.parent?.markHashAsInvalid();
    }

    readonly meta: IRRecursiveMetadata
    get name(): string | undefined { return this.meta.name };

    private _parent: IRParentTerm | undefined;
    get parent(): IRParentTerm | undefined { return this._parent; }
    set parent( newParent: IRTerm | undefined )
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

    clone(): IRRecursive
    {
        return new IRRecursive(
            this._body.clone(),
            this.meta.name,
            this.isHashPresent() ? this.hash : undefined
        );
    }

    toJSON() { return this.toJson(); }
    toJson(): any
    {
        return {
            type: "IRRecursive",
            arity: this.arity,
            body: this._body.toJson()
        };
    }
}