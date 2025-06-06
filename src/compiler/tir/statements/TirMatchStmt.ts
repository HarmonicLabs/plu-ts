import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { filterSortedStrArrInplace } from "../../../utils/array/filterSortedStrArrInplace";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt, TirStmt } from "./TirStmt";
import { TirVarDecl } from "./TirVarDecl/TirVarDecl";

export class TirMatchStmt
    implements ITirStmt
{
    constructor(
        readonly matchExpr: TirExpr,
        readonly cases: TirMatchStmtCase[],
        readonly range: SourceRange,
    ) {}

    hasReturnStmt(): boolean
    {
        return this.cases.some(({ body }) => body.hasReturnStmt());
    }

    definitelyTerminates(): boolean
    {
        return this.cases.every(({ body }) => body.definitelyTerminates());
    }

    deps(): string[]
    {
        const deps = this.matchExpr.deps();
        for (const caseStmt of this.cases) {
            mergeSortedStrArrInplace(
                deps,
                caseStmt.deps()
            );
        }
        return deps;
    }
}

export class TirMatchStmtCase
    implements HasSourceRange
{
    constructor(
        readonly pattern: TirVarDecl,
        readonly body: TirStmt,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        const introducedVars = this.pattern.introducedVars();
        return filterSortedStrArrInplace(
            this.body.deps(),
            introducedVars
        );
    }
}