import { ContinueStmt } from "../../../../ast/nodes/statements/ContinueStmt";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirContinueStmt } from "../../../tir/statements/TirContinueStmt";
import { AstCompilationCtx } from "../../AstCompilationCtx";

export function _compileContinueStmt(
    ctx: AstCompilationCtx,
    stmt: ContinueStmt
): [ TirContinueStmt ] | undefined
{
    if( !ctx.isLoop ) return ctx.error(
        DiagnosticCode.A_continue_statement_can_only_be_used_within_a_loop,
        stmt.range
    );
    return [ new TirContinueStmt( stmt.range ) ];
}