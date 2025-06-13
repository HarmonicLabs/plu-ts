import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";

/**
 * `arrLikeExpr[ indexExpr ]`
 */
export class TirElemAccessExpr
    implements ITirExpr
{
    constructor(
        public arrLikeExpr: TirExpr,
        public indexExpr: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    deps(): string[]
    {
        const deps: string[] = this.arrLikeExpr.deps();
        mergeSortedStrArrInplace( deps, this.indexExpr.deps() );
        return deps;
    }
}