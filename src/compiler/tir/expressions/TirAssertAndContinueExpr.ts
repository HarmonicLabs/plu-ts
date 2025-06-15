import { SourceRange } from "../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirAssertStmt } from "../statements/TirAssertStmt";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";

export class TirAssertAndContinueExpr
    implements ITirExpr
{
    get type(): TirType
    {
        return this.continuation.type;
    }
    constructor(
        readonly conditions: ITirExpr[],
        readonly continuation: ITirExpr,
        readonly range: SourceRange
    ) {}

    deps(): string[]
    {
        return (
            this.conditions
            .reduce(( accum, cond ) => 
                mergeSortedStrArrInplace( accum, cond.deps() ),
                this.continuation.deps()
            )
        );
    }

    static fromStmtsAndContinuation(
        assertions: TirAssertStmt[],
        continuation: ITirExpr,
    ): TirExpr
    {
        if( assertions.length <= 0 ) return continuation;

        return new TirAssertAndContinueExpr(
            assertions.map( a => a.toSafeCondition() ),
            continuation,
            continuation.range
        );
    }
}