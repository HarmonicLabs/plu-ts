import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";


export class FailStmt
    implements HasSourceRange
{
    constructor(
        readonly value: PebbleExpr | undefined,
        readonly range: SourceRange,
    ) {}
}