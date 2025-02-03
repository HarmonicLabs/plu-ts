import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";


export class AssertStmt
    implements HasSourceRange
{
    constructor(
        readonly condition: PebbleExpr,
        readonly elseExpr: PebbleExpr | undefined,
        readonly range: SourceRange,
    ) {}
}