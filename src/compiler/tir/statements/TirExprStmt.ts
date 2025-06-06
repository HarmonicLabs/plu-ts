import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt } from "./TirStmt";

/**
 * usually expressions with side effects
 * 
 * includes `increment` and `decrement` expressions (i++, i--, etc.)
 * and function calls that do have side effects
 * (traces (if allowed), assertions and failing operations)
**/
export class TirExprStmt
    implements ITirStmt
{
    constructor(
        readonly expr: TirExpr,
        readonly range: SourceRange
    ) {}

    hasReturnStmt(): boolean { return false; }

    definitelyTerminates(): boolean { return false; }

    deps(): string[]
    {
        return this.expr.deps();
    }
}