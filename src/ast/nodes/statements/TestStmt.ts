import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { BlockStmt } from "./BlockStmt";


export class TestStmt
    implements HasSourceRange
{
    constructor(
        readonly testName: string | undefined,
        readonly body: BlockStmt,
        readonly range: SourceRange,
    ) {}
}