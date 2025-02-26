import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirStmt } from "./TirStmt";

export class TirIfStmt
    implements HasSourceRange
{
    constructor(
        readonly condition: TirExpr,
        readonly thenBranch: TirStmt,
        readonly elseBranch: TirStmt | undefined,
        readonly range: SourceRange,
    ) {}
}