import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRHoisted } from "../../../IR/IRNodes/IRHoisted";
import type { IRTerm } from "../../../IR/IRTerm";
import { TirFuncT } from "../types/TirNativeType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
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

    toString(): string
    {
        return `<closed IR> as ${this.type.toString()}`;
    }
    pretty( indent: number ): string
    {
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat(indent);
        return `${indent_base}<closed IR> as ${this.type.toString()}`;
    }

    get isConstant(): boolean { return true; }

    clone(): TirExpr
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