import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { LitStrExpr } from "../expr/litteral/LitStrExpr";
import { HasSourceRange } from "../HasSourceRange";

/**
 * ```ts
 * export { ... } from "module";
 * ```
 */
export class ImportStmt
    implements HasSourceRange
{
    constructor(
        readonly members: ImportDecl[],
        readonly fromPath: LitStrExpr,
        readonly range: SourceRange,
    ) {}
}

export class ImportDecl
    implements HasSourceRange
{
    constructor(
        readonly identifier: Identifier,
        readonly asIdentifier: Identifier | undefined,
        readonly range: SourceRange,
    ) {}
}