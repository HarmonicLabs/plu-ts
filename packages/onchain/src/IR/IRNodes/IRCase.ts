import { blake2b_128 } from "@harmoniclabs/crypto";
import { Cloneable } from "../../utils/Cloneable";
import { ToJson } from "../../utils/ToJson";
import { IRTerm } from "../IRTerm";
import { IHash, IIRParent } from "../interfaces";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { IRParentTerm } from "../utils/isIRParentTerm";
import { BaseIRMetadata } from "./BaseIRMetadata";
import { mapArrayLike } from "./utils/mapArrayLike";
import { isIRTerm } from "../utils";
import { makeArrayLikeProxy } from "./utils/makeArrayLikeProxy";
import { MutArrayLike } from "../utils/MutArrayLike";
import { floatAsBytes, isMurmurHash, murmurHash } from "../murmur";
import { fromHex } from "@harmoniclabs/uint8array-utils";

export interface IRCaseMeta extends BaseIRMetadata {}

export class IRCase
    implements Cloneable<IRCase>, IHash, IIRParent, ToJson
{
    constrTerm!: IRTerm;
    continuations!: MutArrayLike<IRTerm>;

    readonly hash!: number;
    readonly depth!: number;
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;

    parent: IRParentTerm | undefined;

    readonly meta: IRCaseMeta

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_1011 ]); }

    constructor(
        constrTerm: IRTerm,
        continuations: ArrayLike<IRTerm>,
        meta: IRCaseMeta = {},
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

        constrTerm.parent = self;

        Object.defineProperty(
            this, "constrTerm", {
                get: () => constrTerm,
                set: ( next: any ) => {
                    if( isIRTerm( next ) )
                    {
                        const cloned = next.clone();
                        cloned.parent = self;
                        self.markHashAsInvalid();
                        constrTerm = cloned;
                    }
                    return next;
                },
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "continuations", {
                value: makeArrayLikeProxy(
                    continuations,
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
                constrTerm.depth,
                ...mapArrayLike( self.continuations , cont => cont.depth )
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
                        // calculate hashes first
                        // so dont need to recalculate depths implicitly
                        const constrHash = floatAsBytes(
                            self.constrTerm.hash
                        );
                        const contsHashes = mapArrayLike( self.continuations, f => floatAsBytes( f.hash ) );

                        depth = calcDepth();
                        let depthStr = depth.toString( 16 );
                        if( depthStr.length % 2 === 1 ) depthStr = "0" + depthStr;
                        // basically a merkle tree
                        hash = murmurHash(
                            concatUint8Arr(
                                IRCase.tag,
                                fromHex( depthStr ),
                                constrHash,
                                ...contsHashes
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

    clone(): IRCase
    {
        return new IRCase(
            this.constrTerm,
            mapArrayLike( this.continuations, f => f.clone() ),
            { ...this.meta },
            this.isHashPresent() ? this.hash : undefined
        );
    }

    toJson(): any
    {
        return {
            constrTerm: this.constrTerm.toString(),
            continuations: mapArrayLike( this.continuations, f => f.toJson() )
        };
    }
}