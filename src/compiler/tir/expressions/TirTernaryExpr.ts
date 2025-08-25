import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRNative, IRTerm } from "../../../IR";
import { _ir_apps } from "../../../IR/tree_utils/_ir_apps";
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
        return _ir_apps(
            IRNative._lazyIfThenElse,
            this.condition.toIR( ctx ),
            this.ifTrue.toIR( ctx ),
            this.ifFalse.toIR( ctx )
        );
    }
}