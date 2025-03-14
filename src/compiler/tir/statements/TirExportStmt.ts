import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirLitStrExpr } from "../expressions/litteral/TirLitStrExpr";
import { TirImportDecl } from "./TirImportStmt";

/**
 * ```ts
 * export { ... } from "module";
 * ```
 */
export class TirExportStmt
    implements HasSourceRange
{
    constructor(
        readonly members: TirImportDecl[],
        readonly path: TirLitStrExpr,
        readonly range: SourceRange,
    ) {}
}