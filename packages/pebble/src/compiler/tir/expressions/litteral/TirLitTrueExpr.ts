import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { bool_t } from "../../program/stdScope/stdScope";
import { IRConst, IRTerm } from "../../../../IR";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { TirExpr } from "../TirExpr";

export class TirLitTrueExpr implements ITirExpr
{
    readonly type: TirType = bool_t;
    readonly isConstant: boolean = true;
    
    constructor(
        readonly range: SourceRange
    ) {}

    pretty(): string { return this.toString(); }
    toString(): string
    {
        return "true";
    }

    clone(): TirExpr
    {
        return new TirLitTrueExpr(this.range.clone());
    }

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return IRConst.bool( true );
    }
}