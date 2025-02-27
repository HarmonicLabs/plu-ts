import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";

export class TirReturnStmt
    implements HasSourceRange
{
    constructor(
        readonly value: TirExpr | undefined,
        readonly range: SourceRange,
    ) {}
}