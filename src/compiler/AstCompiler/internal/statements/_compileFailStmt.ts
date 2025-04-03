import { FailStmt } from "../../../../ast/nodes/statements/FailStmt";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirExpr } from "../../../tir/expressions/TirExpr";
import { TirFailStmt } from "../../../tir/statements/TirFailStmt";
import { canAssignTo } from "../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { string_t } from "../../scope/stdScope/stdScope";
import { _compileExpr } from "../exprs/_compileExpr";

export function _compileFailStmt(
    ctx: AstCompilationCtx,
    stmt: FailStmt
): [ TirFailStmt ] | undefined
{
    if( !ctx.functionCtx ) return ctx.error(
        DiagnosticCode.A_fail_statement_can_only_be_used_within_a_function_body,
        stmt.range
    );

    let failMsgExpr: TirExpr | undefined = undefined;
    if( stmt.value )
    {
        failMsgExpr = _compileExpr( ctx, stmt.value, string_t );
        if( !failMsgExpr ) return undefined;
        if( !canAssignTo( failMsgExpr.type, string_t ) ) return ctx.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.value.range, failMsgExpr.type.toString(), string_t.toString()
        );
    }

    return [ new TirFailStmt( failMsgExpr, stmt.range ) ];
}