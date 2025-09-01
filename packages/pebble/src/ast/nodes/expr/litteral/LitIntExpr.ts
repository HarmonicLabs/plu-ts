import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";

export class LitIntExpr
    implements HasSourceRange
{
    constructor(
        readonly integer: bigint,
        readonly range: SourceRange
    ) {}
}