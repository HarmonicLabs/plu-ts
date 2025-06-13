import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt } from "./TirStmt";

export class TirReturnStmt
    implements ITirStmt
{
    constructor(
        public value: TirExpr | undefined,
        readonly range: SourceRange,
    ) {}

    hasReturnStmt(): boolean { return true; }

    definitelyTerminates(): boolean { return true; }

    deps(): string[]
    {
        return this.value?.deps() ?? [];
    }
}