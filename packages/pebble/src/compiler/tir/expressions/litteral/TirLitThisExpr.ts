import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { IRTerm, IRVar } from "../../../../IR";

export class TirLitThisExpr
    implements ITirExpr
{
    readonly isConstant: boolean = false;
    
    constructor(
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    toString(): string
    {
        return `this`;
    }

    clone(): TirLitThisExpr
    {
        return new TirLitThisExpr(
            this.type.clone(),
            this.range.clone()
        );
    }

    deps(): string[] { return []; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        const dbn = ctx.getVarSym("this");
        if( typeof dbn !== "symbol" )
        throw new Error("Missing 'this' variable declaration in context");
        return new IRVar( dbn );
    }
}