import { Identifier } from "../../../ast/nodes/common/Identifier";
import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";

export class TirAssignmentStmt
    implements HasSourceRange
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: TirExpr,
        readonly range: SourceRange
    ) {}
}