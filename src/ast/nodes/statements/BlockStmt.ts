import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleStmt } from "./PebbleStmt";

export class BlockStmt
    implements HasSourceRange
{
    constructor(
        readonly stmts: PebbleStmt[],
        readonly range: SourceRange
    ) {}
}