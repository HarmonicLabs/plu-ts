import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { Identifier } from "../common/Identifier";
import { PebbleExpr } from "../expr/PebbleExpr";

/**
 * both `--i` and `i--`
 */
export class DecrStmt
    implements HasSourceRange
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly range: SourceRange
    ) {}
}