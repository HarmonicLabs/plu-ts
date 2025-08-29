import { SourceRange } from "../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { bool_t } from "../program/stdScope/stdScope";
import { TirType } from "../types/TirType";
import { ToIRTermCtx } from "./ToIRTermCtx";
import { IRConst, IRDelayed, IRForced, IRNative, IRTerm } from "../../../IR";
import { _ir_apps } from "../../../IR/tree_utils/_ir_apps";

export class TirTraceIfFalseExpr
    implements ITirExpr
{
    readonly type: TirType = bool_t;

    constructor(
        /** must be boolean or Optional */
        public condition: TirExpr,
        /** must be string */ 
        public traceStrExpr: TirExpr,
        readonly range: SourceRange,
    ) {}

    clone(): TirTraceIfFalseExpr
    {
        return new TirTraceIfFalseExpr(
            this.condition.clone(),
            this.traceStrExpr.clone(),
            this.range.clone()
        );
    }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return new IRForced( _ir_apps(
            IRNative.strictIfThenElse,
            this.condition.toIR( ctx ),
            new IRDelayed( IRConst.bool( true ) ),
            new IRDelayed( _ir_apps(
                IRNative.trace,
                this.traceStrExpr.toIR( ctx ),
                IRConst.bool( false )
            ))
        ));
    }

    get isConstant(): boolean { return this.condition.isConstant && this.traceStrExpr.isConstant; }

    deps(): string[]
    {
        return mergeSortedStrArrInplace(
            this.condition.deps(),
            this.traceStrExpr.deps()
        );
    }
}