import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRHoisted, IRTerm } from "../../../IR";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";


export class TirHoistedExpr
    implements ITirExpr
{
    get type(): TirType {
        return this.expr.type;
    }

    get range(): SourceRange {
        return this.expr.range;
    }

    constructor(
        readonly varName: string,
        public expr: TirExpr
    ) {}

    deps(): string[] {
        return this.expr.deps();
    }

    unsafeClone(): TirHoistedExpr
    {
        return new TirHoistedExpr(
            this.varName,
            this.expr, // this.expr.clone(),
        );
    }

    get isConstant(): boolean { return this.expr.isConstant; }
    
    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return new IRHoisted( this.expr.toIR( ctx ) );
    }
}