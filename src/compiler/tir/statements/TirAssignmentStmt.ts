import { Identifier } from "../../../ast/nodes/common/Identifier";
import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirVariableAccessExpr } from "../expressions/TirVariableAccessExpr";

export class TirAssignmentStmt
    implements HasSourceRange
{
    constructor(
        readonly varIdentifier: TirVariableAccessExpr,
        readonly assignedExpr: TirExpr,
        readonly range: SourceRange
    ) {}
}