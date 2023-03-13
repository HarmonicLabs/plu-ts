import { blake2b_224 } from "../../../crypto";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { GenericTermType, PrimType, TermType, getNRequiredLambdaArgs, isWellFormedGenericType } from "../../pluts";
import { cloneTermType } from "../../pluts/type_system/cloneTermType";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";


export class IRFunc
    implements Cloneable<IRFunc>, IHash
{
    readonly arity!: number;
    readonly type!: [PrimType.Lambda,TermType,TermType]

    readonly hash!: Uint8Array;

    readonly body!: IRTerm

    clone!: () => IRFunc;

    constructor(
        t: [PrimType.Lambda,GenericTermType,GenericTermType],
        body: IRTerm
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

        Object.defineProperty(
            this, "body", {
                value: body,
                writable: false,
                enumerable: true,
                configurable: false
            }
        )
        
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
