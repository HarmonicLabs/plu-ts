import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { BodyStmt } from "./PebbleStmt";

export class DoWhileStmt
    implements HasSourceRange
{
    constructor(
        readonly body: BodyStmt,
        readonly condition: PebbleExpr,
        readonly range: SourceRange,
    ) {}
}