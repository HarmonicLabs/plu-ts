import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { bool_t } from "../../program/stdScope/stdScope";
import { IRConst, IRTerm } from "../../../../IR";
import { ToIRTermCtx } from "../ToIRTermCtx";

export class TirLitTrueExpr implements ITirExpr
{
    readonly type: TirType = bool_t;
    readonly isConstant: boolean = true;
    
    constructor(
        readonly range: SourceRange
    ) {}

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return IRConst.bool( true );
    }
}