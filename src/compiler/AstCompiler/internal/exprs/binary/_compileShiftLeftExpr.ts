import { ShiftLeftExpr } from "../../../../../ast/nodes/expr/binary/BinaryExpr";
import { DiagnosticCode } from "../../../../../diagnostics/diagnosticMessages.generated";
import { TirShiftLeftExpr } from "../../../../tir/expressions/binary/TirBinaryExpr";
import { TirType } from "../../../../tir/types/TirType";
import { canAssignTo } from "../../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../../AstCompilationCtx";
import { bytes_t, int_t } from "../../../scope/stdScope/stdScope";
import { _compileExpr } from "../_compileExpr";

export function _compileShiftLeftExpr(
    ctx: AstCompilationCtx,
    expr: ShiftLeftExpr,
    _typeHint: TirType | undefined
): TirShiftLeftExpr | undefined
{
    const left = _compileExpr( ctx, expr.left, bytes_t );
    if( !left ) return undefined;

    if( !canAssignTo( left.type, bytes_t ) )
    return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        expr.left.range, left.type.toString(), bytes_t.toString()
    );

    const right = _compileExpr( ctx, expr.right, int_t );
    if( !right ) return undefined;

    if( !canAssignTo( right.type, int_t ) )
    return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        expr.right.range, right.type.toString(), int_t.toString()
    );

    return new TirShiftLeftExpr(
        left,
        right,
        // implicit bytes type,
        expr.range
    );
}