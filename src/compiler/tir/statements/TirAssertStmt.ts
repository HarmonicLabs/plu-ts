import { SourceRange } from "../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt } from "./TirStmt";

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

    hasReturnStmt(): boolean { return false; }

    definitelyTerminates(): boolean { return false; }

    deps(): string[]
    {
        const deps = this.condition.deps();
        if (this.elseExpr) {
            mergeSortedStrArrInplace( deps, this.elseExpr.deps() );
        }
        return deps;
    }
}