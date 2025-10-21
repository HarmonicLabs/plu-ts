import { SourceRange } from "../../../ast/Source/SourceRange";
import { ITirStmt } from "./TirStmt";

export class TirBreakStmt
    implements ITirStmt
{
    constructor(
        readonly range: SourceRange,
    ) {}

    toString(): string
    {
        return `break`;
    }
    pretty( indent: number ): string
    {
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat( indent );
        return `${indent_base}break`;
    }
    // loops are transoformed into recursive functions
    // and break statements are transformed into return statements
    // so this statement does terminate the function
    definitelyTerminates(): boolean { return true; }

    deps(): string[] { return []; }
}