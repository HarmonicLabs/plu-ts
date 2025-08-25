import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRTerm } from "../../../IR";
import { _ir_apps } from "../../../IR/tree_utils/_ir_apps";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirCallExpr implements ITirExpr
{
    constructor(
        public func: TirExpr,
        readonly args: TirExpr[],
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    deps(): string[]
    {
        const deps: string[] = this.func.deps();
        for (const arg of this.args) {
            mergeSortedStrArrInplace( deps, arg.deps() );
        }
        return deps;
    }

    get isConstant(): boolean { return false; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return _ir_apps(
            this.func.toIR( ctx ),
            ...(this.args.map( arg => arg.toIR( ctx ) ) as [ IRTerm ]),
        );
    }
}