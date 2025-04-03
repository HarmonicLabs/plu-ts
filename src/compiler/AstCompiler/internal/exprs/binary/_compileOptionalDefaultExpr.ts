import { OptionalDefaultExpr } from "../../../../../ast/nodes/expr/binary/BinaryExpr";
import { DiagnosticCode } from "../../../../../diagnostics/diagnosticMessages.generated";
import { TirOptionalDefaultExpr } from "../../../../tir/expressions/binary/TirBinaryExpr";
import { TirOptT } from "../../../../tir/types/TirNativeType";
import { TirType } from "../../../../tir/types/TirType";
import { canAssignTo } from "../../../../tir/types/type-check-utils/canAssignTo";
import { getOptTypeArg } from "../../../../tir/types/type-check-utils/getOptTypeArg";
import { AstCompilationCtx } from "../../../AstCompilationCtx";
import { _compileExpr } from "../_compileExpr";


export function _compileOptionalDefaultExpr(
    ctx: AstCompilationCtx,
    expr: OptionalDefaultExpr,
    typeHint: TirType | undefined
): TirOptionalDefaultExpr | undefined
{
    const left = _compileExpr( ctx, expr.left, typeHint ? new TirOptT( typeHint ) : undefined );
    if( !left ) return undefined;

    const leftType = left.type;
    const leftOptArg = getOptTypeArg( leftType );
    const returnType = leftOptArg ?? leftType;
    const optReturnType = new TirOptT( returnType );

    if( !leftOptArg ) return ctx.warning(
        DiagnosticCode.Left_side_of_opeartor_is_not_optional_right_side_is_unused,
        expr.right.range
    );

    const right = _compileExpr( ctx, expr.right, leftOptArg ?? typeHint );
    if( !right ) return undefined;

    const isUnwrappedReturn = canAssignTo( right.type, returnType );
    if( !isUnwrappedReturn && !canAssignTo( right.type, optReturnType ) ) return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        expr.right.range, right.type.toString(), returnType.toString()
    );

    return new TirOptionalDefaultExpr(
        left,
        right,
        isUnwrappedReturn ? returnType : optReturnType,
        expr.range
    );
}
