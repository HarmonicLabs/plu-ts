import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRHoisted, IRTerm } from "../../../IR";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";



export class TirInlineClosedIR
    implements ITirExpr
{
    constructor(
        readonly type: TirType,
        readonly getIr: ( ctx: ToIRTermCtx ) => IRTerm,
        readonly range: SourceRange
    ) {}

    get isConstant(): boolean { return true; }

    clone(): ITirExpr
    {
        return new TirInlineClosedIR(
            this.type.clone(),
            this.getIr,
            this.range.clone()
        );
    }

    deps(): string[]
    {
        return []; // closed IR has no dependencies
    }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        // since closed, we can hoist to avoid duplications
        return new IRHoisted( this.getIr( ctx ) );
    }
}