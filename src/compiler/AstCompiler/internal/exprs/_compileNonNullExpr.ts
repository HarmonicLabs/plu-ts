import { NonNullExpr } from "../../../../ast/nodes/expr/unary/NonNullExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirNonNullExpr } from "../../../tir/expressions/TirNonNullExpr";
import { TirType } from "../../../tir/types/TirType";
import { getOptTypeArg } from "../../../tir/types/type-check-utils/getOptTypeArg";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileExpr } from "./_compileExpr";


export function _compileNonNullExpr(
    ctx: AstCompilationCtx,
    expr: NonNullExpr,
    typeHint: TirType | undefined
): TirNonNullExpr | undefined
{
    const operand = _compileExpr( ctx, expr.operand, typeHint );
    if( !operand ) return undefined;
    const operandType = operand.type;
    const nonNullType = getOptTypeArg( operandType );
    if( !nonNullType ) ctx.warning(
        DiagnosticCode.Non_null_opeartor_used_on_expression_of_type_0_which_is_not_optional_this_will_be_omitted_during_compilation,
        expr.operand.range, operandType.toString()
    );
    return new TirNonNullExpr(
        operand,
        nonNullType ?? operandType,
        expr.range
    );
}