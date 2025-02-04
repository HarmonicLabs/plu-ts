import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";

export class ExprStmt
    implements HasSourceRange
{
    constructor(
        readonly expr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}