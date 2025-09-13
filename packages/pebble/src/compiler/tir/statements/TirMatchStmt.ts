import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { filterSortedStrArrInplace } from "../../../utils/array/filterSortedStrArrInplace";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirCasePattern } from "../expressions/TirCaseExpr";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt, TirStmt } from "./TirStmt";
import { TirNamedDeconstructVarDecl } from "./TirVarDecl/TirNamedDeconstructVarDecl";
export class TirMatchStmt
    implements ITirStmt
{
    constructor(
        readonly matchExpr: TirExpr,
        readonly cases: TirMatchStmtCase[],
        public wildcardCase: TirMatchStmtWildcardCase | undefined,
        readonly range: SourceRange,
    ) {}

    toString(): string
    {
        return (
            `match ( ${this.matchExpr.toString()} ) { ` +
            this.cases.map( c =>
                `when ${c.pattern.toString()}: ${c.body.toString()};`
            ).join(" ") +
            ( this.wildcardCase ? ` else ${this.wildcardCase.body.toString()};` : "" ) +
            ` }`
        );
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
        if( this.wildcardCase ) mergeSortedStrArrInplace(
            deps,
            this.wildcardCase.deps()
        );
        return deps;
    }
}

export class TirMatchStmtCase
    implements HasSourceRange
{
    constructor(
        public pattern: TirNamedDeconstructVarDecl,
        public body: TirStmt,
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

export class TirMatchStmtWildcardCase
    implements HasSourceRange
{
    constructor(
        public body: TirStmt,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        return this.body.deps();
    }
}