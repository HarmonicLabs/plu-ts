import { TypeConversionExpr } from "../../../../ast/nodes/expr/TypeConversionExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirTypeConversionExpr } from "../../../tir/expressions/TirTypeConversionExpr";
import { TirType } from "../../../tir/types/TirType";
import { canCastTo } from "../../../tir/types/type-check-utils/canCastTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileConcreteTypeExpr } from "../types/_compileConcreteTypeExpr";
import { _compileExpr } from "./_compileExpr";

export function _compileTypeConversionExpr(
    ctx: AstCompilationCtx,
    ast: TypeConversionExpr,
    typeHint: TirType | undefined
): TirTypeConversionExpr | undefined
{
    const targetType = _compileConcreteTypeExpr( ctx, ast.asType );
    if( !targetType ) return undefined;

    const expr = _compileExpr( ctx, ast.expr, targetType );
    if( !expr ) return undefined;

    if( !canCastTo( expr.type, targetType ) ) return ctx.error(
        DiagnosticCode.Type_0_cannot_be_converted_to_type_1,
        ast.expr.range, expr.type.toString(), targetType.toString()
    );

    return new TirTypeConversionExpr(
        expr,
        targetType,
        ast.range
    );
}