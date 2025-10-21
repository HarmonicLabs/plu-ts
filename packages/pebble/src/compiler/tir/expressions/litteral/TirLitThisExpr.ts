import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { IRTerm, IRVar } from "../../../../IR";
import { TirExpr } from "../TirExpr";

export class TirLitThisExpr
    implements ITirExpr
{
    readonly isConstant: boolean = false;
    
    constructor(
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    pretty(): string { return this.toString(); }
    toString(): string
    {
        return `this`;
    }

    clone(): TirExpr
    {
        return new TirLitThisExpr(
            this.type.clone(),
            this.range.clone()
        );
    }

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        const sym = ctx.getVarAccessSym("this");
        if( typeof sym !== "symbol" )
        throw new Error("Missing 'this' variable declaration in context");
        return new IRVar( sym );
    }
}