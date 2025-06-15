import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { filterSortedStrArrInplace } from "../../../utils/array/filterSortedStrArrInplace";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt, TirStmt } from "./TirStmt";
import { TirSimpleVarDecl } from "./TirVarDecl/TirSimpleVarDecl";
import { TirVarDecl } from "./TirVarDecl/TirVarDecl";

/**
 * ***NOT*** for...of loop
 * 
 * for( init; condition; update ) body
 */
export class TirForStmt
    implements ITirStmt
{
    constructor(
        readonly init: TirSimpleVarDecl[],
        readonly condition: TirExpr | undefined,
        readonly update: TirStmt[] | undefined,
        public body: TirStmt,
        readonly range: SourceRange,
    ) {}

    definitelyTerminates(): boolean
    {
        return this.body.definitelyTerminates() ||  (this.update?.some( stmt => stmt.definitelyTerminates() ) ?? false);
    }

    deps(): string[]
    {
        const { deps, introducedVars } = this.init.reduce((acc, decl) => {
            mergeSortedStrArrInplace(
                acc.deps,
                filterSortedStrArrInplace(
                    decl.deps(),
                    acc.introducedVars
                )
            );
            mergeSortedStrArrInplace(
                acc.introducedVars,
                decl.introducedVars()
            );
            return acc;
        }, { deps: [] as string[], introducedVars: [] as string[] });

        function addDeps( otherDeps: string[] )
        {
            mergeSortedStrArrInplace(
                deps,
                filterSortedStrArrInplace(
                    otherDeps,
                    introducedVars
                )
            );
        }

        addDeps(this.condition?.deps() ?? []);
        for( const stmt of this.update ?? [] ) addDeps(stmt.deps());
        addDeps( this.body.deps() );

        return deps;
    }
}