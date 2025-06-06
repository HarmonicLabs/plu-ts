import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { filterSortedStrArrInplace } from "../../../utils/array/filterSortedStrArrInplace";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirVarDecl } from "../statements/TirVarDecl/TirVarDecl";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";

export class TirCaseExpr
    implements ITirExpr
{
    constructor(
        readonly matchExpr: TirExpr,
        readonly cases: TirCaseExprMatcher[],
        readonly type: TirType,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        const deps: string[] = this.matchExpr.deps();
        for (const matcher of this.cases) {
            mergeSortedStrArrInplace( deps, matcher.deps() );
        }
        return deps;
    }
}

export class TirCaseExprMatcher
    implements HasSourceRange
{
    constructor(
        readonly pattern: TirVarDecl,
        readonly body: TirExpr,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        const nonDeps = this.pattern.introducedVars();
        const deps: string[] = this.body.deps();
        filterSortedStrArrInplace( deps, nonDeps );
        return deps;
    }
}