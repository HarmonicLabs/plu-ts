import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRSelfCall } from "../../../IR/IRNodes/IRSelfCall";
import { IRVar } from "../../../IR/IRNodes/IRVar";
import { ResolveValueResult } from "../../AstCompiler/scope/AstScope";
import { TirType } from "../types/TirType";
import type { ITirExpr } from "./ITirExpr";
import type { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirVariableAccessExpr
    implements ITirExpr
{
    readonly resolvedValue: Readonly<ResolveValueResult>;
    private readonly _creationStack: string | undefined;

    get type(): TirType {
        return this.resolvedValue.variableInfos.type;
    }
    constructor(
        resolvedValue: ResolveValueResult, 
        readonly range: SourceRange
    ) {
        this.resolvedValue = Object.freeze( resolvedValue );
        this._creationStack = (new Error()).stack;
    }

    toString(): string {
        return this.varName;
    }
    pretty( indent: number ): string {
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat(indent);
        return `${indent_base}${this.varName}`;
    }

    clone(): TirExpr
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

    deps(): string[] { return [ this.varName ]; }

    toIR( ctx: ToIRTermCtx ): IRVar | IRSelfCall
    {
        const ir = ctx.getVarAccessIR( this.varName );
        if(!(
            ir instanceof IRVar
            || ir instanceof IRSelfCall
        )) {
            console.log( this.resolvedValue );
            throw new Error(`variable '${this.varName}' is missing`);
        }
        return ir;
    }
}