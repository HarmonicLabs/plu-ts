import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirStmt } from "./TirStmt";

export class TirWhileStmt
    implements HasSourceRange
{
    constructor(
        readonly condition: TirExpr,
        readonly body: TirStmt,
        readonly range: SourceRange,
    ) {}
}