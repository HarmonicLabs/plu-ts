import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";

export class LitThisExpr implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}