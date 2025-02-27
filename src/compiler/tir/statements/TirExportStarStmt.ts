import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";

export class TirExportStarStmt
    implements HasSourceRange
{
    constructor(
        readonly fromPath: TirLitStrExpr,
        readonly range: SourceRange,
    ) {}
}