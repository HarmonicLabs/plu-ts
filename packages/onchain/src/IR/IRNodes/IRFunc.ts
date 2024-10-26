import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { BasePlutsError } from "../../utils/BasePlutsError";
import { ToJson } from "../../utils/ToJson";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";
import { equalIrHash, hashIrData, IRHash, isIRHash } from "../IRHash";
import { shallowEqualIRTermHash } from "../utils/equalIRTerm";
import { IRNodeKind } from "../IRNodeKind";

export interface IRFuncMetadata extends BaseIRMetadata {}

export class IRFunc
    implements Cloneable<IRFunc>, IHash, IIRParent, ToJson
{
    readonly arity!: number;

    constructor(
        arity: number,
        body: IRTerm,
        func_name?: string | undefined,
        _unsafeHash?: IRHash
    )
    {
        if( !Number.isSafeInteger( arity ) && arity >= 1 )
        throw new BasePlutsError(
            "invalid arity for 'IRFunc'"
        )

        if( !isIRTerm( body ) )
        throw new Error("IRFunc body argument was not an IRTerm");

        Object.defineProperties(
            this, {
                arity: {
                    value: arity,
                    writable: false,
                    enumerable: true,
                    configurable: false
                },
                meta: {
                    value: {
                        name: typeof func_name === "string" ? func_name : (void 0)
                    },
                    writable: true,
                    enumerable: true,
                    configurable: false
                }
            }
        );

        this._body = body;
        this._body.parent = this;

        this._hash = isIRHash( _unsafeHash ) ? _unsafeHash : undefined;
        
        this._parent = undefined;
    }

    static get kind(): IRNodeKind.Func { return  IRNodeKind.Func; }
    get kind(): IRNodeKind.Func { return IRFunc.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRFunc.kind ]); }

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
                    IRFunc.tag,
                    positiveIntAsBytes( this.arity ),
                    this._body.hash
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

    readonly meta: IRFuncMetadata
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

    clone(): IRFunc
    {
        return new IRFunc(
            this.arity,
            this._body.clone(),
            this.meta.name,
            this.isHashPresent() ? this.hash : undefined
        )
    }
    toJSON() { return this.toJson(); }
    toJson(): any
    {
        return {
            type: "IRFunc",
            arity: this.arity,
            body: this._body.toJson()
        }
    }
}
