import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRDelayed } from "../../../IR/IRNodes/IRDelayed";
import { IRError } from "../../../IR/IRNodes/IRError";
import { IRForced } from "../../../IR/IRNodes/IRForced";
import { IRNative } from "../../../IR/IRNodes/IRNative";
import { IRTerm } from "../../../IR/IRTerm";
import { _ir_apps } from "../../../IR/tree_utils/_ir_apps";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirAssertStmt } from "../statements/TirAssertStmt";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirAssertAndContinueExpr
    implements ITirExpr
{
    get type(): TirType
    {
        return this.continuation.type;
    }
    constructor(
        public conditions: TirExpr[],
        public continuation: TirExpr,
        readonly range: SourceRange
    ) {}

    /// @ts-ignore Return type annotation circularly references itself.
    clone(): TirAssertAndContinueExpr
    {
        return new TirAssertAndContinueExpr(
            this.conditions.map( c => c.clone() ),
            this.continuation.clone(),
            this.range.clone()
        );
    }

    static fromStmtsAndContinuation(
        assertions: TirAssertStmt[],
        continuation: TirExpr,
    ): TirExpr
    {
        if( assertions.length <= 0 ) return continuation;

        return new TirAssertAndContinueExpr(
            assertions.map( a => a.toSafeCondition() ),
            continuation,
            continuation.range
        );
    }

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

    get isConstant(): boolean { return this.continuation.isConstant; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        const irContinuation = this.continuation.toIR( ctx );
        
        if( this.conditions.length <= 0 ) return irContinuation;

        let irConditions: IRTerm = this.conditions.pop()!.toIR( ctx );

        irConditions = this.conditions.reduce(( ir, cond ) => _ir_apps(
            IRNative._strictAnd,
            ir,
            cond.toIR( ctx ),
        ), irConditions );

        return new IRForced( _ir_apps(
            IRNative.strictIfThenElse,
            irConditions,
            new IRDelayed( irContinuation ),
            new IRDelayed( new IRError() )
        ));
    }
    
}