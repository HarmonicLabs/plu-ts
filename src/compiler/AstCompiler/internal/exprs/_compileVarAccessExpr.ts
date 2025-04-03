import { Identifier } from "../../../../ast/nodes/common/Identifier";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirVariableAccessExpr } from "../../../tir/expressions/TirVariableAccessExpr";
import { TirType } from "../../../tir/types/TirType";
import { AstCompilationCtx } from "../../AstCompilationCtx";

export function _compileVarAccessExpr(
    ctx: AstCompilationCtx,
    expr: Identifier,
    typeHint: TirType | undefined
): TirVariableAccessExpr | undefined
{
    const resolvedValue = ctx.scope.resolveValue( expr.text );
    if( !resolvedValue ) return ctx.error(
        DiagnosticCode._0_is_not_defined,
        expr.range, expr.text
    );
    const [ varSym, isDefinedOutsideFuncScope ] = resolvedValue;
    return new TirVariableAccessExpr(
        expr.text,
        varSym.type,
        expr.range
    );
}