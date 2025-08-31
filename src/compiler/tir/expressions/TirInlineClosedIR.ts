import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRHoisted } from "../../../IR/IRNodes/IRHoisted";
import type { IRTerm } from "../../../IR/IRTerm";
import { TirFuncT } from "../types/TirNativeType";
import { ITirExpr } from "./ITirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";



export class TirInlineClosedIR
    implements ITirExpr
{
    sig(): TirFuncT
    {
        return this.type;
    }


    constructor(
        readonly type: TirFuncT,
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