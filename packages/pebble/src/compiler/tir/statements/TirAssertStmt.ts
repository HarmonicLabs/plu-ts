import { SourceRange } from "../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt } from "./TirStmt";
import { TirTraceIfFalseExpr } from "../expressions/TirTraceIfFalseExpr";

export class TirAssertStmt
    implements ITirStmt
{
    constructor(
        /** must be boolean or Optional */
        public condition: TirExpr,
        /** must be string */
        public elseExpr: TirExpr | undefined,
        readonly range: SourceRange,
    ) {}

    toString(): string
    {
        return (
            `assert ${this.condition.toString()}` +
            ( this.elseExpr ? ` else ${this.elseExpr.toString()}` : "" )
        );
    }

    definitelyTerminates(): boolean { return false; }

    deps(): string[]
    {
        const deps = this.condition.deps();
        if (this.elseExpr) {
            mergeSortedStrArrInplace( deps, this.elseExpr.deps() );
        }
        return deps;
    }

    toSafeCondition(): TirExpr
    {
        if( !this.elseExpr ) return this.condition;

        return new TirTraceIfFalseExpr(
            this.condition,
            this.elseExpr,
            this.range
        );
    }
}