import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirStmt } from "./TirStmt";
import { TirVarDecl } from "./TirVarDecl/TirVarDecl";

export class TirMatchStmt
    implements HasSourceRange
{
    constructor(
        readonly matchExpr: TirExpr,
        readonly cases: TirMatchStmtCase[],
        readonly range: SourceRange,
    ) {}
}

export class TirMatchStmtCase
    implements HasSourceRange
{
    constructor(
        readonly pattern: TirVarDecl,
        readonly body: TirStmt,
        readonly range: SourceRange,
    ) {}
}