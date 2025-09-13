import { SourceRange } from "../../../ast/Source/SourceRange";
import { ITirStmt } from "./TirStmt";

export class TirContinueStmt
    implements ITirStmt
{
    constructor(
        readonly range: SourceRange,
    ) {}

    toString(): string
    {
        return `continue`;
    }

    // loops are transoformed into recursive functions
    // and continue statements are transformed into return statements
    // so this statement does terminate the function
    definitelyTerminates(): boolean { return true; }

    deps(): string[]
    {
        return [];
    }
}