import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";


export class EmptyStmt
    implements HasSourceRange
{
    constructor(
        readonly range: SourceRange,
    ) {}
}