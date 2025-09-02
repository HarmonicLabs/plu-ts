import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";

export class LitFailExpr implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}