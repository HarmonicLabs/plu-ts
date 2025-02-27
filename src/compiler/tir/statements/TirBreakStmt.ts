import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";

export class TirBreakStmt
    implements HasSourceRange
{
    constructor(
        readonly range: SourceRange,
    ) {}
}