import { CEKConst, isCEKValue, Machine } from "@harmoniclabs/plutus-machine";
import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { compileIRToUPLC, IRConst, IRNative, IRTerm } from "../../../IR";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";
import { _ir_apps } from "../../../IR/tree_utils/_ir_apps";

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

    get isConstant(): boolean
    {
        return this.arrLikeExpr.isConstant && this.indexExpr.isConstant;
    }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        let irArr = this.arrLikeExpr.toIR( ctx );
        let irIndex = this.indexExpr.toIR( ctx );
        if( this.indexExpr.isConstant )
        {
            const result = Machine.evalSimple(
                compileIRToUPLC( irIndex )
            );
            if(
                ( result instanceof CEKConst )
                && (typeof result.value === "number" || typeof result.value === "bigint" )
            ) return _ir_apps(
                IRNative._indexList,
                irArr,
                IRConst.int( result.value ),
            );
        }

        return _ir_apps(
            IRNative._indexList,
            irArr,
            irIndex
        );
    }
}