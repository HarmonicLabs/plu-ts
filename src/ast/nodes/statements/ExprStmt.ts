import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";

/**
 * usually expressions with side effects
 * 
 * includes `increment` and `decrement` expressions (i++, i--, etc.)
 * and function calls that do have side effects
 * (traces (if allowed), assertions and failing operations)
**/
export class ExprStmt
    implements HasSourceRange
{
    constructor(
        readonly expr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}