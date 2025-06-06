import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt, TirStmt } from "./TirStmt";

export class TirWhileStmt
    implements ITirStmt
{
    constructor(
        readonly condition: TirExpr,
        readonly body: TirStmt,
        readonly range: SourceRange,
    ) {}

    hasReturnStmt(): boolean
    {
        return this.body.hasReturnStmt();
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