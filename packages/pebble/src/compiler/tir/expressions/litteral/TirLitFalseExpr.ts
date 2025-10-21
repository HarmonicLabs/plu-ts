import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { bool_t } from "../../program/stdScope/stdScope";
import { IRTerm, IRConst } from "../../../../IR";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { TirExpr } from "../TirExpr";

export class TirLitFalseExpr implements ITirExpr
{
    readonly type: TirType = bool_t;
    readonly isConstant: boolean = true;
    
    constructor(
        readonly range: SourceRange
    ) {}

    pretty(): string { return this.toString(); }
    toString(): string
    {
        return "false";
    }

    clone(): TirExpr
    {
        return new TirLitFalseExpr(this.range.clone());
    }

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return IRConst.bool( false );
    }
}