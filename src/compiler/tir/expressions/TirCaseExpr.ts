import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRTerm } from "../../../IR";
import { filterSortedStrArrInplace } from "../../../utils/array/filterSortedStrArrInplace";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirArrayLikeDeconstr } from "../statements/TirVarDecl/TirArrayLikeDeconstr";
import { TirNamedDeconstructVarDecl } from "../statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { TirSingleDeconstructVarDecl } from "../statements/TirVarDecl/TirSingleDeconstructVarDecl";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirCaseExpr
    implements ITirExpr
{
    constructor(
        public matchExpr: TirExpr,
        readonly cases: TirCaseMatcher[],
        readonly wildcardCase: TirWildcardCaseMatcher | undefined,
        readonly type: TirType,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        const deps: string[] = this.matchExpr.deps();
        for( const matcher of this.cases ) {
            mergeSortedStrArrInplace( deps, matcher.deps() );
        }
        if( this.wildcardCase ) mergeSortedStrArrInplace( deps, this.wildcardCase.deps() );
        return deps;
    }

    get isConstant(): boolean { return false }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        
    }
}

export type TirCasePattern
    = TirNamedDeconstructVarDecl
    // | TirSingleDeconstructVarDecl
    // | TirArrayLikeDeconstr
    ;

export class TirCaseMatcher
    implements HasSourceRange
{
    constructor(
        readonly pattern: TirCasePattern,
        public body: TirExpr,
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

export class TirWildcardCaseMatcher
    implements HasSourceRange
{
    constructor(
        public body: TirExpr,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        return this.body.deps();
    }
}