import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";

export class IncrStmt
    implements HasSourceRange
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly range: SourceRange
    ) {}
}