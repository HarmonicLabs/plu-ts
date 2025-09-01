import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";

export class LitTrueExpr implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}