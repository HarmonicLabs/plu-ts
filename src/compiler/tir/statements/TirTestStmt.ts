import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirBlockStmt } from "./TirBlockStmt";
import { ITirStmt } from "./TirStmt";

export class TirTestStmt
    implements ITirStmt
{
    constructor(
        readonly testName: string | undefined,
        readonly body: TirBlockStmt,
        readonly range: SourceRange,
    ) {}

    hasReturnStmt(): boolean { return false; }

    definitelyTerminates(): boolean { return false; }

    deps(): string[]
    {
        return this.body.deps();
    }
}