import { ElemAccessExpr } from "../../../../ast/nodes/expr/ElemAccessExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirElemAccessExpr } from "../../../tir/expressions/TirElemAccessExpr";
import { TirListT } from "../../../tir/types/TirNativeType/native/list";
import { TirType } from "../../../tir/types/TirType";
import { canAssignTo } from "../../../tir/types/utils/canAssignTo";
import { getListTypeArg } from "../../../tir/types/utils/getListTypeArg";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileExpr } from "./_compileExpr";

export function _compileElemAccessExpr(
    ctx: AstCompilationCtx,
    expr: ElemAccessExpr,
    typeHint: TirType | undefined
): TirElemAccessExpr | undefined
{
    const int_t = ctx.program.stdTypes.int;
    
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