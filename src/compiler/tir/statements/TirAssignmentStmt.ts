import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirVariableAccessExpr } from "../expressions/TirVariableAccessExpr";
import { ITirStmt } from "./TirStmt";

export class TirAssignmentStmt
    implements ITirStmt
{
    constructor(
        readonly varIdentifier: TirVariableAccessExpr,
        readonly assignedExpr: TirExpr,
        readonly range: SourceRange
    ) {}

    hasReturnStmt(): boolean { return false; }

    definitelyTerminates(): boolean { return false; }

    deps(): string[]
    {
        return this.varIdentifier.deps();
    }
}