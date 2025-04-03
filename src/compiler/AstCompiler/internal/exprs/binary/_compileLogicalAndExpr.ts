import { LogicalAndExpr } from "../../../../../ast/nodes/expr/binary/BinaryExpr";
import { DiagnosticCode } from "../../../../../diagnostics/diagnosticMessages.generated";
import { TirLogicalAndExpr } from "../../../../tir/expressions/binary/TirBinaryExpr";
import { TirType } from "../../../../tir/types/TirType";
import { canAssignTo } from "../../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../../AstCompilationCtx";
import { bool_t } from "../../../scope/stdScope/stdScope";
import { _compileExpr } from "../_compileExpr";

export function _compileLogicalAndExpr(
    ctx: AstCompilationCtx,
    expr: LogicalAndExpr,
    _typeHint: TirType | undefined
): TirLogicalAndExpr | undefined
{
    const left = _compileExpr( ctx, expr.left, bool_t );
    if( !left ) return undefined;

    // TODO: accept optionals
    if( !canAssignTo( left.type, bool_t ) )
    return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        expr.left.range, left.type.toString(), bool_t.toString()
    );

    const right = _compileExpr( ctx, expr.right, bool_t );
    if( !right ) return undefined;

    // TODO: accept optionals
    if( !canAssignTo( right.type, bool_t ) )
    return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        expr.right.range, right.type.toString(), bool_t.toString()
    );

    return new TirLogicalAndExpr(
        left,
        right,
        // implicit bool type,
        expr.range
    );
}