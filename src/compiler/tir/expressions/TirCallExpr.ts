import { SourceRange } from "../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";

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
}