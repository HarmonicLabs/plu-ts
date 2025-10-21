import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt, TirStmt } from "./TirStmt";

export class TirWhileStmt
    implements ITirStmt
{
    constructor(
        readonly condition: TirExpr,
        public body: TirStmt,
        readonly range: SourceRange,
    ) {}

    toString(): string
    {
        return (
            `while( ${this.condition.toString()} ) ` +
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
            `while(` +
            indent_1 + this.condition.pretty( indent + 1 ) +
            `${indent_0}) ` +
            this.body.pretty( indent )
        );
    }

    definitelyTerminates(): boolean
    {
        return this.body.definitelyTerminates();
    }
    
    deps(): string[]
    {
        return [
            ...new Set(
                this.condition.deps()
                .concat(this.body.deps())
            )
        ];
    }
}