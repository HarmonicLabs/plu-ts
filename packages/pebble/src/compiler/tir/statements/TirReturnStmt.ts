import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt } from "./TirStmt";

export class TirReturnStmt
    implements ITirStmt
{
    constructor(
        public value: TirExpr,
        readonly range: SourceRange,
    ) {}

    toString(): string
    {
        return `return ${this.value?.toString() ?? ""}`;
    }
    pretty( indent: number ): string
    {
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat( indent );
        return `${indent_base}return ${this.value.pretty( indent )}`;
    }
    definitelyTerminates(): boolean { return true; }

    deps(): string[]
    {
        return this.value?.deps() ?? [];
    }
}