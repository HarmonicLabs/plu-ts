import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";

export class LitContextExpr implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}