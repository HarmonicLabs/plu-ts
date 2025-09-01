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
        const dbn = ctx.getVarAccessDbn("this");
        if( typeof dbn !== "bigint" )
        throw new Error("Missing 'this' variable declaration in context");
        return new IRVar( dbn );
    }
}