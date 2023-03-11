import ObjectUtils from "../../../utils/ObjectUtils";
import { PrimType, TermType, getNRequiredLambdaArgs } from "../../pluts";
import { IRTerm } from "../IRTerm";

export class IRFunc
{
    readonly arity!: number;
    readonly type!: [PrimType.Lambda,TermType,TermType]

    constructor( t: [PrimType.Lambda,TermType,TermType], body: IRTerm )
    {
        ObjectUtils.defineReadOnlyProperty(
            this, "arity", getNRequiredLambdaArgs( t )
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "type", t // TODO: cloneTermType
        );
    }
}