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
import { equalIrHash, hashIrData, IRHash, isIRHash } from "../IRHash";

export interface IRCaseMeta extends BaseIRMetadata {}

export class IRCase
    implements Cloneable<IRCase>, IHash, IIRParent, ToJson
{
    constrTerm!: IRTerm;
    continuations!: MutArrayLike<IRTerm>;

    readonly hash!: IRHash;
    markHashAsInvalid!: () => void;
    isHashPresent: () => boolean;

    parent: IRParentTerm | undefined;

    readonly meta: IRCaseMeta

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_1011 ]); }

    constructor(
        constrTerm: IRTerm,
        continuations: ArrayLike<IRTerm>,
        meta: IRCaseMeta = {},
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

        constrTerm.parent = self;

        Object.defineProperty(
            this, "constrTerm", {
                get: () => constrTerm,
                set: ( next: any ) => {
                    if( isIRTerm( next ) )
                    {
                        if(!equalIrHash( constrTerm.hash, next.hash )) self.markHashAsInvalid();
                        // keep the parent reference in the old child, useful for compilation
                        // constrTerm.parent = undefined;
                        constrTerm = next;
                        constrTerm.parent = self;
                    }
                    return next;
                },
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "continuations", {
                value: makeArrayLikeProxy<IRTerm>(
                    continuations,
                    isIRTerm,
                    // initModifyElem
                    // function called once for each element in the array
                    // only at element definition
                    newElem => {
                        newElem.parent = self;
                        return newElem;
                    },
                    // modifyElem
                    (newElem, oldElem) => {
                        // keep the parent reference in the old child, useful for compilation
                        // oldElem.parent = undefined;
                        newElem.parent = self;
                        if(!equalIrHash( oldElem.hash, newElem.hash )) self.markHashAsInvalid();
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
                                IRCase.tag,
                                self.constrTerm.hash,
                                ...mapArrayLike( self.continuations, f => f.hash )
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