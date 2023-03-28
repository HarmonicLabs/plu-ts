import { blake2b_128 } from "../../../crypto";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { ToJson } from "../../../utils/ts/ToJson";
import { Lambda } from "../../UPLC/UPLCTerms/Lambda";
import { ToUPLC } from "../../UPLC/interfaces/ToUPLC";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";


export class IRFunc
    implements Cloneable<IRFunc>, IHash, IIRParent, ToJson
{
    readonly arity!: number;

    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;

    body!: IRTerm

    parent: IRTerm | undefined;

    clone!: () => IRFunc;

    constructor(
        arity: number,
        body: IRTerm
    )
    {
        if( !Number.isSafeInteger( arity ) && arity >= 1 )
        throw new BasePlutsError(
            "invalid arity for 'IRfunc'"
        )

        ObjectUtils.defineReadOnlyProperty(
            this, "arity", arity
        );

        let _body: IRTerm;
        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = blake2b_128(
                            concatUint8Arr(
                                IRFunc.tag,
                                positiveIntAsBytes( this.arity ),
                                _body.hash
                            )
                        )
                    }
                    return hash.slice();
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => {
                    hash = undefined;
                    this.parent?.markHashAsInvalid()
                },
                writable: false,
                enumerable:  false,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "body", {
                get: () => _body,
                set: ( newBody: IRTerm ) => {
                    if(!isIRTerm( newBody ))
                    {
                        throw new BasePlutsError(
                            "invalid IRTerm to be a function body"
                        );
                    }
                    this.markHashAsInvalid();
                    _body = newBody;
                    _body.parent = this;
                },
                enumerable: true,
                configurable: false
            }
        );
        this.body = body;
        
        let _parent: IRTerm | undefined = undefined;
        Object.defineProperty(
            this, "parent",
            {
                get: () => _parent,
                set: ( newParent: IRTerm | undefined ) => {

                    if( newParent === undefined || isIRTerm( newParent ) )
                    {
                        _parent = newParent;
                    }

                },
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "clone",
            {
                value: () => {
                    return new IRFunc(
                        this.arity,
                        body.clone()
                    )
                },
                writable: false,
                enumerable: true,
                configurable: false
            }
        );
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_00001 ]); }

    toJson(): any
    {
        return {
            type: "IRFunc",
            arity: this.arity,
            body: this.body.toJson()
        }
    }
}
