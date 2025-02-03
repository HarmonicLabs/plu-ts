import { SourceRange } from "../../Source/SourceRange";
import { VarDecl } from "../declarations/VarDecl/VarDecl";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { BlockStmt } from "./BlockStmt";

export class MatchStmt
    implements HasSourceRange
{
    constructor(
        readonly matchExpr: PebbleExpr,
        readonly cases: MatchStmtCase[],
        readonly range: SourceRange,
    ) {}
}

export class MatchStmtCase
    implements HasSourceRange
{
    constructor(
        readonly pattern: VarDecl,
        readonly body: BlockStmt,
        readonly range: SourceRange,
    ) {}
}