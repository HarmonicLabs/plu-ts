import { IsExpr } from "../../../../ast/nodes/expr/IsExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirIsExpr } from "../../../tir/expressions/TirIsExpr";
import { TirType } from "../../../tir/types/TirType";
import { getStructType } from "../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { bool_t } from "../../scope/stdScope/stdScope";
import { _compileExpr } from "./_compileExpr";

export function _compileIsExpr(
    ctx: AstCompilationCtx,
    expr: IsExpr,
    _typeHint: TirType | undefined
): TirIsExpr | undefined
{
    const target = _compileExpr( ctx, expr.instanceExpr, undefined );
    if( !target ) return undefined;

    const structType = getStructType( target.type );
    if( !structType ) return ctx.error(
        DiagnosticCode.Cannot_use_is_operator_on_a_value_that_is_not_a_struct_type,
        expr.instanceExpr.range
    );

    const targetCtorId = expr.ofType;
    const targetCtorName = targetCtorId.text;

    const structCtors = structType.constructors;
    const targetCtor = structCtors.find( ctor => ctor.name === targetCtorName );
    if( !targetCtor ) return ctx.error(
        DiagnosticCode.Constructor_0_is_not_part_of_the_definition_of_1,
        expr.ofType.range, targetCtorName, structType.toString()
    );

    if( structCtors.length === 1 )
    ctx.warning(
        DiagnosticCode.This_check_is_redundant_Struct_0_has_only_one_possible_constructor,
        expr.range, structType.toString()
    );

    return new TirIsExpr(
        target,
        expr.ofType,
        bool_t,
        expr.range
    );
}