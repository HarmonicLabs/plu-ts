import { SourceRange } from "../../../ast/Source/SourceRange";
import { filterSortedStrArrInplace } from "../../../utils/array/filterSortedStrArrInplace";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { ITirStmt, TirStmt } from "./TirStmt";
import { isTirVarDecl } from "./TirVarDecl/TirVarDecl";

export class TirBlockStmt
    implements ITirStmt
{
    constructor(
        public stmts: TirStmt[],
        readonly range: SourceRange
    ) {}

    hasReturnStmt(): boolean
    {
        // start from the end as it is more likely to have a return statement there
        for( let i = this.stmts.length - 1; i >= 0; i-- )
        {
            if( this.stmts[i].hasReturnStmt() ) return true;
        }
        return false;
    }

    definitelyTerminates(): boolean
    {
        return this.stmts.some( stmt => stmt.definitelyTerminates() );
    }

    deps(): string[]
    {
        const deps: string[] = [];
        const introducedVars: string[] = [];
        for( const stmt of this.stmts )
        {
            mergeSortedStrArrInplace(
                deps,
                filterSortedStrArrInplace(
                    stmt.deps(),
                    introducedVars
                )
            );

            if( isTirVarDecl( stmt ) )
            {
                mergeSortedStrArrInplace( introducedVars, stmt.introducedVars() );
            }
        }
        return deps;
    }
}