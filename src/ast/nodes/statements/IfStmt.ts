import { PebbleAst } from "../../PebbleAst";
import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";

export class IfStmt
    implements HasSourceRange
{
    constructor(
        readonly condition: PebbleExpr,
        readonly thenBranch: PebbleAst,
        readonly elseBranch: PebbleAst | undefined,
        readonly range: SourceRange,
    ) {}
}