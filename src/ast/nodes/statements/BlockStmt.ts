import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { BodyStmt } from "./PebbleStmt";

export class BlockStmt
    implements HasSourceRange
{
    constructor(
        readonly stmts: BodyStmt[],
        readonly range: SourceRange
    ) {}
}