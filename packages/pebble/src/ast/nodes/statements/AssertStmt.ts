import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";


export class AssertStmt
    implements HasSourceRange
{
    constructor(
        /** must be boolean or Optional */
        public condition: PebbleExpr,
        /** must be string */
        public elseExpr: PebbleExpr | undefined,
        readonly range: SourceRange,
    ) {}
}