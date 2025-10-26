import { SourceRange } from "../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt, Termination, TirStmt } from "./TirStmt";

export class TirIfStmt
    implements ITirStmt
{
    constructor(
        readonly condition: TirExpr,
        public thenBranch: TirStmt,
        public elseBranch: TirStmt | undefined,
        readonly range: SourceRange,
    ) {
    }

    toString(): string
    {
        return (
            `if( ${this.condition.toString()} ) ` +
            this.thenBranch.toString() +
            ( this.elseBranch ? ` else ${this.elseBranch.toString()}` : `` )
        );
    }
    pretty( indent: number ): string
    {
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat( indent );
        const indent_0 = "\n" + indent_base;
        const indent_1 = indent_0 + singleIndent;
        return (
            `if(` +
            indent_1 + this.condition.pretty( indent + 1 ) +
            `${indent_0}) ` +
            this.thenBranch.pretty( indent ) +
            ( this.elseBranch ? ` else ${this.elseBranch.pretty( indent )}` : "" )
        );
    }

    definitelyTerminates(): boolean
    {
        return (
            this.thenBranch.definitelyTerminates()
            && (this.elseBranch?.definitelyTerminates() ?? false)
        );
    }

    deps(): string[]
    {
        const deps = this.condition.deps();
        mergeSortedStrArrInplace( deps, this.thenBranch.deps() );
        this.elseBranch && mergeSortedStrArrInplace( deps, this.elseBranch.deps()  );
        return deps;
    }
}