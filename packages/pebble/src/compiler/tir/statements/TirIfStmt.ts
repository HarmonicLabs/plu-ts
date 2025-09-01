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
    ) {}

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