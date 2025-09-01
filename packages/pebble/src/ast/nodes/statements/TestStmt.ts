import { SourceRange } from "../../Source/SourceRange";
import { LitStrExpr } from "../expr/litteral/LitStrExpr";
import { HasSourceRange } from "../HasSourceRange";
import { BlockStmt } from "./BlockStmt";

export class TestStmt
    implements HasSourceRange
{
    constructor(
        readonly testName: LitStrExpr | undefined,
        readonly body: BlockStmt,
        readonly range: SourceRange,
    ) {}
}