import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";


export class AssertStmt
    implements HasSourceRange
{
    constructor(
        /** must be boolean or Optional */
        readonly condition: PebbleExpr,
        /** must be string */
        readonly elseExpr: PebbleExpr | undefined,
        readonly range: SourceRange,
    ) {}
}