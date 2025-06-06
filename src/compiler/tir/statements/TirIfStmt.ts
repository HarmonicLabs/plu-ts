import { SourceRange } from "../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirExpr } from "../expressions/TirExpr";
import { ITirStmt, TirStmt } from "./TirStmt";

export class TirIfStmt
    implements ITirStmt
{
    constructor(
        readonly condition: TirExpr,
        readonly thenBranch: TirStmt,
        readonly elseBranch: TirStmt | undefined,
        readonly range: SourceRange,
    ) {}

    hasReturnStmt(): boolean
    {
        return (
            this.thenBranch.hasReturnStmt()
            || (this.elseBranch?.hasReturnStmt() ?? false)
        );
    }

    definitelyTerminates(): boolean
    {
        return (
            this.thenBranch.definitelyTerminates()
            && (this.elseBranch?.definitelyTerminates() ?? true)
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