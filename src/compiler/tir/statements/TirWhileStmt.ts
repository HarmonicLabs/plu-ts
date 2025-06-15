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