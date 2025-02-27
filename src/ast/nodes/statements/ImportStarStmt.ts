import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { LitStrExpr } from "../expr/litteral/LitStrExpr";
import { HasSourceRange } from "../HasSourceRange";

/**
 * ```ts
 * import * as module from "module";
 * ```
 */
export class ImportStarStmt
    implements HasSourceRange
{
    constructor(
        readonly anIdentifier: Identifier,
        readonly fromPath: LitStrExpr,
        readonly range: SourceRange,
    ) {}
}