import { Identifier } from "../../../ast/nodes/common/Identifier";
import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirLitStrExpr } from "../expressions/litteral/TirLitStrExpr";

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
        readonly fromPath: TirLitStrExpr,
        readonly range: SourceRange,
    ) {}
}