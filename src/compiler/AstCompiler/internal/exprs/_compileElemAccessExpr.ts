import { ElemAccessExpr } from "../../../../ast/nodes/expr/ElemAccessExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirElemAccessExpr } from "../../../tir/expressions/TirElemAccessExpr";
import { TirListT } from "../../../tir/types/TirNativeType";
import { TirType } from "../../../tir/types/TirType";
import { canAssignTo } from "../../../tir/types/type-check-utils/canAssignTo";
import { getListTypeArg } from "../../../tir/types/type-check-utils/getListTypeArg";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { int_t } from "../../scope/stdScope/stdScope";
import { _compileExpr } from "./_compileExpr";

export function _compileElemAccessExpr(
    ctx: AstCompilationCtx,
    expr: ElemAccessExpr,
    typeHint: TirType | undefined
): TirElemAccessExpr | undefined
{
    const litsTypeHint = typeHint ? new TirListT( typeHint ) : undefined;

    const arrLikeExpr = _compileExpr( ctx, expr.arrLikeExpr, litsTypeHint );
    if( !arrLikeExpr ) return undefined;
    
    const arrLikeType = arrLikeExpr.type;
    const elemsType = getListTypeArg( arrLikeType );
    if( !elemsType ) return ctx.error(
        DiagnosticCode.This_expression_cannot_be_indexed,
        expr.arrLikeExpr.range
    );

    const indexExpr = _compileExpr( ctx, expr.indexExpr, int_t );
    if( !indexExpr ) return undefined;
    if( !canAssignTo( indexExpr.type, int_t ) ) return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        expr.indexExpr.range, indexExpr.type.toString(), int_t.toString()
    );

    return new TirElemAccessExpr(
        arrLikeExpr,
        indexExpr,
        elemsType,
        expr.range
    );
}