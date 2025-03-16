import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleStmt } from "./PebbleStmt";

/**
 * ```ts
 * export <PebbleStmt>
 * ```
 */
export class ExportStmt
    implements HasSourceRange
{
    constructor(
        readonly stmt: PebbleStmt,
        readonly range: SourceRange,
    ) {}
}