import { Cloneable } from "../../utils/Cloneable";
import { ToJson } from "../../utils/ToJson";
import { forceBigUInt } from "../../utils/ints";
import { IRTerm } from "../IRTerm";
import { IHash, IIRParent } from "../interfaces";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { IRParentTerm } from "../utils/isIRParentTerm";
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
    fields!: MutArrayLike<IRTerm>;

    readonly hash!: IRHash;
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;

    parent: IRParentTerm | undefined;

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

        Object.defineProperty(
            this, "meta", {
                value: { ...meta },
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

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

        let hash: IRHash | undefined = isIRHash( _unsafeHash ) ? _unsafeHash : undefined;
        Object.defineProperty(
            this, "hash",
            {
                get: () => {
                    if(!isIRHash( hash ))
                    {
                        // basically a merkle tree
                        hash = hashIrData(
                            concatUint8Arr(
                                IRConstr.tag,
                                positiveIntAsBytes( this.index ),
                                ...mapArrayLike( this.fields, f => f.hash )
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
                value: () => isIRHash( hash ),
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
                    this.parent?.markHashAsInvalid();
                },
                writable: false,
                enumerable:  false,
                configurable: false
            }
        );

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