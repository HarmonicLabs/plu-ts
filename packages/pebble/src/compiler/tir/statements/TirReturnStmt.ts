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

    definitelyTerminates(): boolean { return true; }

    deps(): string[]
    {
        return this.value?.deps() ?? [];
    }
}