import { SourceRange } from "../../../../ast/Source/SourceRange";
import { IRConst, IRTerm } from "../../../../IR";
import { void_t } from "../../program/stdScope/stdScope";
import { TirType } from "../../types/TirType";
import { ITirExpr } from "../ITirExpr";
import { TirExpr } from "../TirExpr";
import { ToIRTermCtx } from "../ToIRTermCtx";

export class TirLitVoidExpr implements ITirExpr
{
    readonly type: TirType = void_t;
    readonly isConstant: boolean = true;
    
    constructor(
        readonly range: SourceRange
    ) {}

    pretty(): string { return this.toString(); }
    toString(): string
    {
        return "void";
    }

    clone(): TirExpr
    {
        return new TirLitVoidExpr(this.range.clone());
    }

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return IRConst.unit;
    }
}