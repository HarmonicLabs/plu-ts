import { Cloneable } from "../../utils/Cloneable";
import { ToJson } from "../../utils/ToJson";
import { forceBigUInt } from "../../utils/ints";
import { IRTerm } from "../IRTerm";
import { IHash, IIRParent } from "../interfaces";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { BaseIRMetadata } from "./BaseIRMetadata";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";
import { mapArrayLike } from "./utils/mapArrayLike";
import { isIRTerm } from "../utils";
import { makeArrayLikeProxy } from "./utils/makeArrayLikeProxy";
import { MutArrayLike } from "../utils/MutArrayLike";
import { equalIrHash, hashIrData, IRHash, isIRHash } from "../IRHash";

export interface IRConstrMeta extends BaseIRMetadata {}

export class IRConstr
    implements Cloneable<IRConstr>, IHash, IIRParent, ToJson
{
    readonly index!: bigint;
    readonly fields!: MutArrayLike<IRTerm>;

    readonly meta: IRConstrMeta

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_1010 ]); }

    constructor(
        index: number | bigint,
        fields: ArrayLike<IRTerm>,
        meta: IRConstrMeta = {},
        _unsafeHash?: IRHash
    )
    {
        const self = this;

        this.meta = meta;

        this._parent = undefined;

        Object.defineProperty(
            this, "index", {
                value: forceBigUInt( index ),
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "fields", {
                value: makeArrayLikeProxy<IRTerm>(
                    fields,
                    isIRTerm,
                    // initModifyElem
                    newElem => {
                        // newElem = newElem.clone();
                        newElem.parent = self;
                        // self.markHashAsInvalid()
                        return newElem;
                    },
                    // modifyElem
                    // called before setting the new value
                    // the return value is the value that will be set
                    (newElem, oldElem) => {
                        if(!equalIrHash(oldElem.hash, newElem.hash)) self.markHashAsInvalid()
                        // keep the parent reference in the old child, useful for compilation
                        // oldElem.parent = undefined;
                        newElem.parent = self;
                        return newElem;
                    }
                ),
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

        this._hash = isIRHash( _unsafeHash ) ? _unsafeHash : undefined;
    }

    private _hash: IRHash | undefined;
    get hash(): IRHash
    {
        if(!isIRHash( this._hash ))
        {
            // basically a merkle tree
            this._hash = hashIrData(
                concatUint8Arr(
                    IRConstr.tag,
                    positiveIntAsBytes( this.index ),
                    ...mapArrayLike( this.fields, f => f.hash )
                )
            );
        }
        return this._hash;
    }
    markHashAsInvalid(): void
    {
        this._hash = undefined;
        this.parent?.markHashAsInvalid();
    }
    isHashPresent(): boolean { return isIRHash( this._hash ); }

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
    
    clone(): IRConstr
    {
        return new IRConstr(
            this.index,
            mapArrayLike( this.fields, f => f.clone() ),
            { ...this.meta },
            this.isHashPresent() ? this.hash : undefined
        );
    }

    toJson(): any
    {
        return {
            index: this.index.toString(),
            fields: mapArrayLike( this.fields, f => f.toJson() )
        };
    }
}