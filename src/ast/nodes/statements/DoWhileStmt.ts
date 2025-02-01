import { PebbleAst } from "../../PebbleAst";
import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";

export class DoWhileStmt
    implements HasSourceRange
{
    constructor(
        readonly condition: PebbleExpr,
        readonly body: PebbleAst,
        readonly range: SourceRange,
    ) {}
}