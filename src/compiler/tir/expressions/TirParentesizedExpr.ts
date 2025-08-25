import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRTerm } from "../../../IR";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirParentesizedExpr
    implements HasSourceRange, ITirExpr
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

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return this.expr.toIR( ctx );
    }
}