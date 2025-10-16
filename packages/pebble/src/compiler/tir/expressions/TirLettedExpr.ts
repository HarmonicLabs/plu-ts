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
    get type(): TirType {
        return this.expr.type;
    }

    private readonly _irVarSym: symbol;

    constructor(
        readonly varName: string,
        public expr: TirExpr,
        readonly range: SourceRange,
        _unsafeVarSym?: symbol | undefined
    ) {
        if(!(
            typeof varName === "string"
            && varName.length > 0
        )) throw new Error("TirLettedExpr: varName must be a non empty string");

        this._irVarSym = (
            typeof _unsafeVarSym === "symbol"
            && _unsafeVarSym.description === varName
        ) ? _unsafeVarSym : Symbol( varName );
    }

    toString(): string
    {
        return `/*letted*/(${this.expr.toString()})`;
    }

    deps(): string[] {
        return this.expr.deps();
    }

    clone(): TirLettedExpr
    {
        return new TirLettedExpr(
            this.varName,
            this.expr.clone(),
            this.range.clone(),
            this._irVarSym
        );
    }
    
    unsafeClone(): TirLettedExpr
    {
        return new TirLettedExpr(
            this.varName,
            this.expr, // this.expr.clone(),
            this.range,
            this._irVarSym
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