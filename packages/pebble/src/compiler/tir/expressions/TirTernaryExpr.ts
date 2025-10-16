import { SourceRange } from "../../../ast/Source/SourceRange";
import { _ir_apps } from "../../../IR/IRNodes/IRApp";
import type { IRTerm } from "../../../IR/IRTerm";
import { _ir_lazyIfThenElse } from "../../../IR/tree_utils/_ir_lazyIfThenElse";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirTernaryExpr
    implements ITirExpr
{
    constructor(
        public condition: TirExpr,
        public ifTrue: TirExpr,
        public ifFalse: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    toString(): string
    {
        return `(${this.condition.toString()} ? ${this.ifTrue.toString()} : ${this.ifFalse.toString()})`;
    }

    clone(): TirTernaryExpr
    {
        return new TirTernaryExpr(
            this.condition.clone(),
            this.ifTrue.clone(),
            this.ifFalse.clone(),
            this.type.clone(),
            this.range.clone()
        );
    }

    deps(): string[]
    {
        const deps: string[] = this.condition.deps();
        mergeSortedStrArrInplace( deps, this.ifTrue.deps() );
        mergeSortedStrArrInplace( deps, this.ifFalse.deps() );
        return deps;
    }

    get isConstant(): boolean
    {
        return (
            this.condition.isConstant
            && this.ifTrue.isConstant 
            && this.ifFalse.isConstant
        );
    }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return _ir_lazyIfThenElse(
            this.condition.toIR( ctx ),
            this.ifTrue.toIR( ctx ),
            this.ifFalse.toIR( ctx )
        );
    }
}