import { blake2b_128 } from "@harmoniclabs/crypto";
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
import { floatAsBytes, isMurmurHash, murmurHash } from "../murmur";
import { fromHex } from "@harmoniclabs/uint8array-utils";

export interface IRConstrMeta extends BaseIRMetadata {}

export class IRConstr
    implements Cloneable<IRConstr>, IHash, IIRParent, ToJson
{
    readonly index!: bigint;
    fields!: MutArrayLike<IRTerm>;

    readonly hash!: number;
    readonly depth!: number;
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;

    parent: IRParentTerm | undefined;

    readonly meta: IRConstrMeta

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_1010 ]); }

    constructor(
        index: number | bigint,
        fields: ArrayLike<IRTerm>,
        meta: IRConstrMeta = {},
        _unsafeHash?: number
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
                value: makeArrayLikeProxy(
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
                    newElem => {
                        newElem = newElem.clone();
                        newElem.parent = self;
                        self.markHashAsInvalid()
                        return newElem;
                    }
                ),
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

        function calcDepth(): number
        {
            return Math.max(
                ...mapArrayLike( self.fields, f => f.depth )
            ) + 1;
        }

        let hash: number | undefined = isMurmurHash( _unsafeHash ) ? _unsafeHash : undefined;
        let depth: number | undefined = isMurmurHash( hash ) ? calcDepth() : undefined;

        Object.defineProperty(
            this, "depth",
            {
                get: () => {
                    // we shuld be able to calculate the depth
                    // WITHOUT the hash
                    if( typeof depth !== "number" ) depth = calcDepth();
                    return depth;
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "hash",
            {
                get: () => {
                    if(!isMurmurHash( hash ))
                    {
                        // calculate hases first
                        // so we don't have to recalculate the depth implicitly
                        const fieldsHashes = mapArrayLike( this.fields, f => floatAsBytes( f.hash ) );
                        depth = calcDepth();
                        let depthStr = depth.toString( 16 );
                        if( depthStr.length % 2 === 1 ) depthStr = "0" + depthStr;
                        // basically a merkle tree
                        hash = murmurHash(
                            concatUint8Arr(
                                IRConstr.tag,
                                fromHex( depthStr ),
                                positiveIntAsBytes( this.index ),
                                ...fieldsHashes
                            )
                        );
                    }
                    // return a copy
                    return hash;
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "isHashPresent", {
                value: () => isMurmurHash( hash ),
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
                    depth = undefined;

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