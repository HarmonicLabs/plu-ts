import { SourceRange } from "../../../ast/Source/SourceRange";
import { filterSortedStrArrInplace } from "../../../utils/array/filterSortedStrArrInplace";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt, TirStmt } from "./TirStmt";
import { TirVarDecl } from "./TirVarDecl/TirVarDecl";

/**
 * for( `elemDeclaration` of iterable ) body
 */
export class TirForOfStmt
    implements ITirStmt
{
    constructor(
        readonly elemDeclaration: TirVarDecl,
        readonly iterable: TirExpr,
        public body: TirStmt,
        readonly range: SourceRange,
    ) {}

    toString(): string {
        return (
            `for( ${this.elemDeclaration.toString()} of ${this.iterable.toString()} ) ` +
            this.body.toString()
        );
    }
    pretty( indent: number ): string
    {
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat( indent );
        const indent_0 = "\n" + indent_base;
        const indent_1 = indent_0 + singleIndent;
        return (
            `${indent_base}for(` +
            indent_1 + this.elemDeclaration.pretty( indent + 1 ) + ` of ` + this.iterable.pretty( indent + 1 ) +
            `${indent_0}) ` +
            this.body.pretty( indent )
        );
    }

    definitelyTerminates(): boolean {
        return this.body.definitelyTerminates();
    }

    deps(): string[]
    {
        const deps = this.iterable.deps();
        const introducedVars = this.elemDeclaration.introducedVars();

        return mergeSortedStrArrInplace(
            deps,
            filterSortedStrArrInplace(
                this.body.deps(),
                introducedVars
            )
        );
    }
}