import { SourceRange } from "../../Source/SourceRange";
import { VarDecl } from "./declarations/VarDecl/VarDecl";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { BodyStmt } from "./PebbleStmt";

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
        readonly body: BodyStmt,
        readonly range: SourceRange,
    ) {}
}