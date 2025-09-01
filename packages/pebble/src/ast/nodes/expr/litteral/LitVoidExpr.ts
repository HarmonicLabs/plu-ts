import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";

export class LitVoidExpr implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}