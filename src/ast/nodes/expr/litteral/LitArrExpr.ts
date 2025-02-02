import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleExpr } from "../PebbleExpr";

export class LitArrExpr
    implements HasSourceRange
{
    constructor(
        readonly elems: PebbleExpr[],
        readonly range: SourceRange
    ) {}
}