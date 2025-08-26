import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRTerm } from "../../../IR";
import { _ir_apps } from "../../../IR/tree_utils/_ir_apps";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirTypeConversionExpr
    implements ITirExpr
{
    constructor(
        public expr: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    deps(): string[]
    {
        return this.expr.deps();
    }

    get isConstant(): boolean { return this.expr.isConstant; }

    clone(): TirTypeConversionExpr
    {
        return new TirTypeConversionExpr(
            this.expr.clone(),
            this.type.clone(),
            this.range.clone()
        );
    }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
    }
}