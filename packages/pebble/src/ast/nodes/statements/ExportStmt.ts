import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { BodyStmt } from "./PebbleStmt";

/**
 * ```ts
 * export <PebbleStmt>
 * ```
 */
export class ExportStmt
    implements HasSourceRange
{
    constructor(
        readonly stmt: BodyStmt,
        readonly range: SourceRange,
    ) {}
}