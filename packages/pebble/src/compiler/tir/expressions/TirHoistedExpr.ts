import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRHoisted } from "../../../IR/IRNodes/IRHoisted";
import type { IRTerm } from "../../../IR/IRTerm";
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

    toString(): string
    {
        return this.expr.toString();
    }

    clone(): TirHoistedExpr
    {
        return new TirHoistedExpr(
            this.varName,
            this.expr.clone(),
        );
    }

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