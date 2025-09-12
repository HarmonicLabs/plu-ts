import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";


export class FailStmt
    implements HasSourceRange
{
    constructor(
        /** must be string (or utf8 bytes) */
        public value: PebbleExpr | undefined,
        readonly range: SourceRange,
    ) {}
}