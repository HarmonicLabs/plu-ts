import { Identifier } from "../../../ast/nodes/common/Identifier";
import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";

/**
 * ```ts
 * export { ... } from "module";
 * ```
 */
export class TirImportStmt
    implements HasSourceRange
{
    constructor(
        readonly members: TirImportDecl[],
        readonly fromPath: TirLitStrExpr,
        readonly range: SourceRange,
    ) {}
}

export class TirImportDecl
    implements HasSourceRange
{
    constructor(
        readonly identifier: Identifier,
        readonly asIdentifier: Identifier | undefined,
        readonly range: SourceRange,
    ) {}
}