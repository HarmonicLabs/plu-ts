import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";

export class TirContinueStmt
    implements HasSourceRange
{
    constructor(
        readonly range: SourceRange,
    ) {}
}