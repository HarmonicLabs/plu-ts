import { SourceRange } from "../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { ITirExpr } from "../expressions/ITirExpr";
import { TirExpr } from "../expressions/TirExpr";
import { bool_t } from "../program/stdScope/stdScope";
import { TirType } from "../types/TirType";

export class TirTraceIfFalseExpr
    implements ITirExpr
{
    get type(): TirType
    {
        return bool_t;
    }

    constructor(
        /** must be boolean or Optional */
        public condition: TirExpr,
        /** must be string */ 
        public traceStrExpr: TirExpr,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        return mergeSortedStrArrInplace(
            this.condition.deps(),
            this.traceStrExpr.deps()
        );
    }
}