import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRLetted, IRTerm } from "../../../IR";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";


export class TirLettedExpr
    implements ITirExpr
{
    get type(): TirType {
        return this.expr.type;
    }

    constructor(
        readonly varName: string,
        public expr: TirExpr,
        readonly range: SourceRange
    ) {}

    deps(): string[] {
        return this.expr.deps();
    }

    unsafeClone(): TirLettedExpr
    {
        return new TirLettedExpr(
            this.varName,
            this.expr, // this.expr.clone(),
            this.range
        );
    }

    get isConstant(): boolean { return this.expr.isConstant; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return new IRLetted( ctx.dbn, this.expr.toIR( ctx ) );
    }
}