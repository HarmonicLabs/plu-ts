import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";

export class TirFailStmt
    implements HasSourceRange
{
    constructor(
        /** must be string (or utf8 bytes) */
        readonly failMsgExpr: TirExpr | undefined,
        readonly range: SourceRange,
    ) {}
}