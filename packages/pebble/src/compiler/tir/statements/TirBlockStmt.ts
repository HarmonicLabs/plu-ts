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

    toString(): string
    {
        return (
            `{ ` +
            this.stmts.map( s => s.toString() ).join("; ") +
            `}`
        );
    }

    pretty( indent: number ): string
    {
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat( indent );
        const indent_0 = "\n" + indent_base;
        const indent_1 = indent_0 + singleIndent;
        if( this.stmts.length === 0 ) return `${indent_0}{ }`;
        return (
            `{` +
            "\n" + indent_1 + this.stmts.map( s => s.pretty( indent + 1 ) ).join(`;${indent_1}`) +
            `${indent_0}}`
        );
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