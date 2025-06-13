import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";

export class TirFailExpr
    implements ITirExpr
{
    constructor(
        /** must be string (or utf8 bytes) */
        public failMsgExpr: TirExpr | undefined,
        readonly type: TirType,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        return this.failMsgExpr?.deps() ?? []
    }
}