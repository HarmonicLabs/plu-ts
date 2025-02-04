import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { LitStrExpr } from "../expr/litteral/LitStrExpr";
import { HasSourceRange } from "../HasSourceRange";

/**
 * ```ts
 * export { ... } from "module";
 * ```
 */
export class ImportStarStmt
    implements HasSourceRange
{
    constructor(
        readonly anIdentifier: Identifier,
        readonly path: LitStrExpr,
        readonly range: SourceRange,
    ) {}
}