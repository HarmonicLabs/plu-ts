import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";

export class LitUndefExpr implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}