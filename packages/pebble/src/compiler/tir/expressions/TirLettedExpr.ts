import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRLetted } from "../../../IR/IRNodes/IRLetted";
import type { IRTerm } from "../../../IR/IRTerm";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirLettedExpr
    implements ITirExpr
{
    private _creationStack: string | undefined = undefined;
    get type(): TirType {
        return this.expr.type;
    }

    private readonly _irVarSym: symbol;

    constructor(
        readonly varName: string,
        public expr: TirExpr,
        readonly range: SourceRange,
        _unsafeVarSym?: symbol | undefined,
        _creationStack?: string | undefined,
    ) {
        if(!(
            typeof varName === "string"
            && varName.length > 0
        )) throw new Error("TirLettedExpr: varName must be a non empty string");

        this._creationStack = _creationStack ?? (new Error()).stack;

        this._irVarSym = (
            typeof _unsafeVarSym === "symbol"
            && _unsafeVarSym.description === varName
        ) ? _unsafeVarSym : Symbol( varName );
    }

    toString(): string
    {
        return `/*letted '${this.varName}'*/(${this.expr.toString()})`;
    }
    pretty( indent: number ): string
    {
        console.log("prettying letted:", this.varName, this._creationStack);
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat(indent);
        const indent_0 = "\n" + indent_base;
        return `/*letted '${this.varName}'*/(${indent_0}${this.expr.pretty(indent)}${indent_0})`;
    }

    deps(): string[] {
        return this.expr.deps();
    }

    clone(): TirExpr
    {
        return new TirLettedExpr(
            this.varName,
            this.expr.clone() as any,
            this.range.clone(),
            this._irVarSym,
            this._creationStack
        );
    }
    
    get isConstant(): boolean { return this.expr.isConstant; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return new IRLetted(
            this._irVarSym,
            this.expr.toIR( ctx )
        );
    }
}