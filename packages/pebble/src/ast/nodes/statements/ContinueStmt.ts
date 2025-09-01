import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";

export class ContinueStmt
    implements HasSourceRange
{
    constructor(
        readonly range: SourceRange,
    ) {}
}