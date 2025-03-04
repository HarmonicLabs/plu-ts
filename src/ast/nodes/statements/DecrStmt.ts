import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";

/**
 * both `--i` and `i--`
 */
export class DecrStmt
    implements HasSourceRange
{
    constructor(
        readonly operandVarName: PebbleExpr,
        readonly range: SourceRange
    ) {}
}