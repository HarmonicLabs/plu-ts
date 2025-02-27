import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
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
        readonly path: LitStrExpr,
        readonly range: SourceRange,
    ) {}
}