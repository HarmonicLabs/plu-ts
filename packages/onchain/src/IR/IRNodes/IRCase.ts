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

export interface IRCaseMeta extends BaseIRMetadata {}

export class IRCase
    implements Cloneable<IRCase>, IHash, IIRParent, ToJson
{
    constrTerm!: IRTerm;
    continuations!: ArrayLike<IRTerm>;

    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;

    parent: IRParentTerm | undefined;

    readonly meta: IRCaseMeta

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_1011 ]); }

    constructor(
        constrTerm: IRTerm,
        continuations: ArrayLike<IRTerm>,
        meta: IRCaseMeta = {},
        _unsafeHash?: Uint8Array
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

        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash",
            {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        // basically a merkle tree
                        hash = blake2b_128(
                            concatUint8Arr(
                                IRCase.tag,
                                self.constrTerm.hash,
                                ...mapArrayLike( self.continuations, f => f.hash )
                            )
                        );
                    }
                    // return a copy
                    return hash.slice()
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "isHashPresent", {
                value: () => hash instanceof Uint8Array,
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