import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";

export class LitFalseExpr implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}