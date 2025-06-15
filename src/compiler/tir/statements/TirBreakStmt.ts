import { SourceRange } from "../../../ast/Source/SourceRange";
import { ITirStmt } from "./TirStmt";

export class TirBreakStmt
    implements ITirStmt
{
    constructor(
        readonly range: SourceRange,
    ) {}

    // loops are transoformed into recursive functions
    // and break statements are transformed into return statements
    // so this statement does terminate the function
    definitelyTerminates(): boolean { return true; }

    deps(): string[] { return []; }
}