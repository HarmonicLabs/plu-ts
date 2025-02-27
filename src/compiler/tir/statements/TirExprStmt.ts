import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";

/**
 * usually expressions with side effects
 * 
 * includes `increment` and `decrement` expressions (i++, i--, etc.)
 * and function calls that do have side effects
 * (traces (if allowed), assertions and failing operations)
**/
export class TirExprStmt
    implements HasSourceRange
{
    constructor(
        readonly expr: TirExpr,
        readonly range: SourceRange
    ) {}
}