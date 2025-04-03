import { TernaryExpr } from "../../../../ast/nodes/expr/TernaryExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirTernaryExpr } from "../../../tir/expressions/TirTernaryExpr";
import { TirType } from "../../../tir/types/TirType";
import { canAssignTo } from "../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { bool_t } from "../../scope/stdScope/stdScope";
import { _compileExpr } from "./_compileExpr";

export function _compileTernaryExpr(
    ctx: AstCompilationCtx,
    expr: TernaryExpr,
    typeHint: TirType | undefined
): TirTernaryExpr | undefined
{
    const cond = _compileExpr( ctx, expr.condition, bool_t );
    if( !cond ) return undefined;
    if( !canAssignTo( cond.type, bool_t ) ) return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        expr.condition.range, cond.type.toString(), bool_t.toString()
    );

    const thenExpr = _compileExpr( ctx, expr.ifTrue, typeHint );
    if( !thenExpr ) return undefined;

    const returnType = thenExpr.type;

    const elseExpr = _compileExpr( ctx, expr.ifFalse, returnType );
    if( !elseExpr ) return undefined;

    if( !canAssignTo( elseExpr.type, returnType ) ) return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        expr.ifFalse.range, elseExpr.type.toString(), returnType.toString()
    );

    return new TirTernaryExpr(
        cond,
        thenExpr,
        elseExpr,
        returnType,
        expr.range
    );
}