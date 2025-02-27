import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";

export class TirAssertStmt
    implements HasSourceRange
{
    constructor(
        /** must be boolean or Optional */
        readonly condition: TirExpr,
        /** must be string */
        readonly elseExpr: TirExpr | undefined,
        readonly range: SourceRange,
    ) {}
}