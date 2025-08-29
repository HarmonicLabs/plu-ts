import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRTerm } from "../../../IR";
import { IRVar } from "../../../IR/IRNodes/IRVar";
import { ResolveValueResult } from "../../AstCompiler/scope/AstScope";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirVariableAccessExpr
    implements ITirExpr
{
    get type(): TirType {
        return this.resolvedValue.variableInfos.type;
    }
    constructor(
        readonly resolvedValue: ResolveValueResult, 
        readonly range: SourceRange
    ) {}

    clone(): TirVariableAccessExpr
    {
        return new TirVariableAccessExpr(
            this.resolvedValue,
            this.range.clone()
        );
    }
    
    get isConstant(): boolean { return false; }

    get varName(): string {
        return this.resolvedValue.variableInfos.name;
    }

    deps(): string[]
    {
        return [ this.varName ];
    }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        // TODO: handle recursive calls 
        /*
        const dbn = ctx.getVarAccessDbn( this.varName );
        if( typeof dbn !== "bigint" )
        throw new Error("Missing 'this' variable declaration in context");
        return new IRVar( dbn );
        //*/
    }
}