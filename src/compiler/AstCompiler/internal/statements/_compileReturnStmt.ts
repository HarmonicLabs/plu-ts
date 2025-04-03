import { ReturnStmt } from "../../../../ast/nodes/statements/ReturnStmt";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirLitVoidExpr } from "../../../tir/expressions/litteral/TirLitVoidExpr";
import { TirReturnStmt } from "../../../tir/statements/TirReturnStmt";
import { canAssignTo } from "../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileExpr } from "../exprs/_compileExpr";

export function _compileReturnStmt(
    ctx: AstCompilationCtx,
    stmt: ReturnStmt
): [ TirReturnStmt ] | undefined
{
    if( !ctx.functionCtx ) return ctx.error(
        DiagnosticCode.A_return_statement_can_only_be_used_within_a_function_body,
        stmt.range
    );
    const hintReturn = ctx.functionCtx.returnHints;
    const expr = stmt.value ?
    _compileExpr(
        ctx,
        stmt.value,
        hintReturn.type
    ) : new TirLitVoidExpr( stmt.range );
    if( !expr ) return undefined;

    if( !hintReturn.type ) {
        hintReturn.type = expr.type;
        hintReturn.isInferred = true;
    }

    if( !canAssignTo( expr.type, hintReturn.type ) ) return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        stmt.value?.range ?? stmt.range, expr.type.toString(), hintReturn.type.toString()
    );

    return [ new TirReturnStmt( expr, stmt.range ) ];
}