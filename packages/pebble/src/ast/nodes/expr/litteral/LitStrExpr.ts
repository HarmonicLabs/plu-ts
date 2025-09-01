import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";

export class LitStrExpr
    implements HasSourceRange
{
    constructor(
        readonly string: string,
        readonly range: SourceRange
    ) {}
}