import { SourceRange } from "../../../ast/Source/SourceRange";
import { ITirStmt } from "./TirStmt";

export class TirContinueStmt
    implements ITirStmt
{
    constructor(
        readonly range: SourceRange,
    ) {}

    hasReturnStmt(): boolean { return false; }

    definitelyTerminates(): boolean { return false; }

    deps(): string[]
    {
        return [];
    }
}