import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";

export class BreakStmt
    implements HasSourceRange
{
    constructor(
        readonly range: SourceRange,
    ) {}
}