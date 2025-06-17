import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { int_t } from "../../program/stdScope/stdScope";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { IRConst, IRTerm } from "../../../../IR";

export class TirLitIntExpr
    implements ITirExpr
{
    readonly type: TirType = int_t;
    readonly isConstant: boolean = true;
    
    constructor(
        readonly integer: bigint,
        readonly range: SourceRange
    ) {}

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return IRConst.int( this.integer );
    }
}