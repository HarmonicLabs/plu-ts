import { TypeConversionExpr } from "../../../../ast/nodes/expr/TypeConversionExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirTypeConversionExpr } from "../../../tir/expressions/TirTypeConversionExpr";
import { TirType } from "../../../tir/types/TirType";
import { canAssignTo } from "../../../tir/types/utils/canAssignTo";
import { canCastTo } from "../../../tir/types/utils/canCastTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileExpr } from "./_compileExpr";

export function _compileTypeConversionExpr(
    ctx: AstCompilationCtx,
    ast: TypeConversionExpr,
    typeHint: TirType | undefined
): TirTypeConversionExpr | undefined
{
    const data_t = ctx.program.stdTypes.data;

    const possibleTargetTypeTirNames = ctx.scope.resolveType( ast.asType.toAstName() )
    if( !possibleTargetTypeTirNames ) {
        console.log(ctx.scope)
        return ctx.error(
            DiagnosticCode._0_is_not_defined,
            ast.asType.range,
            ast.asType.toAstName()
        );
    }

    const sopTargetType = ctx.program.types.get( possibleTargetTypeTirNames.sopTirName );
    if( !sopTargetType ) return ctx.error(
        DiagnosticCode._0_is_not_defined,
        ast.asType.range,
        ast.asType.toAstName()
    );

    const dataTargetType = typeof possibleTargetTypeTirNames.dataTirName === "string" ?
        ctx.program.types.get( possibleTargetTypeTirNames.dataTirName ) :
        undefined;

    const expr = _compileExpr( ctx, ast.expr, dataTargetType );
    if( !expr ) return undefined;

    const targetType: TirType = (
        dataTargetType
        && canAssignTo( expr.type, data_t )
    ) ? dataTargetType : sopTargetType;

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