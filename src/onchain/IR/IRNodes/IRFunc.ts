import { blake2b_224 } from "../../../crypto";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { GenericTermType, PrimType, TermType, getNRequiredLambdaArgs, isWellFormedGenericType } from "../../pluts";
import { cloneTermType } from "../../pluts/type_system/cloneTermType";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { IIRParent } from "../interfaces/IIRParent";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";


export class IRFunc
    implements Cloneable<IRFunc>, IHash, IIRParent
{
    readonly arity!: number;
    readonly type!: [PrimType.Lambda,TermType,TermType]

    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;

    body!: IRTerm

    parent: IRTerm | undefined;

    clone!: () => IRFunc;

    constructor(
        t: [PrimType.Lambda,GenericTermType,GenericTermType],
        body: IRTerm,
        irParent?: IRTerm
    )
    {
        if( !isWellFormedGenericType( t ) )
        throw new BasePlutsError(
            "ill formed term type passed to IRFunc consturctor"
        )

        ObjectUtils.defineReadOnlyProperty(
            this, "arity", getNRequiredLambdaArgs( t )
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "type", cloneTermType( t )
        );

        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = blake2b_224(
                            concatUint8Arr(
                                IRFunc.tag,
                                positiveIntAsBytes( this.arity ),
                                body.hash
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
                enumerable:  true,
                configurable: false
            }
        );

        let _body: IRTerm;
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
        this.parent = irParent;

        ObjectUtils.defineReadOnlyProperty(
            this, "clone",
            {
                value: () => {
                    return new IRFunc(
                        t,
                        body.clone()
                    )
                }
            }
        );
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_00001 ]); }

}
