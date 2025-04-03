import { BreakStmt } from "../../../../ast/nodes/statements/BreakStmt";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirBreakStmt } from "../../../tir/statements/TirBreakStmt";
import { AstCompilationCtx } from "../../AstCompilationCtx";

export function _compileBreakStmt(
    ctx: AstCompilationCtx,
    stmt: BreakStmt
): [ TirBreakStmt ] | undefined
{
    if( !ctx.isLoop ) return ctx.error(
        DiagnosticCode.A_break_statement_can_only_be_used_within_a_loop,
        stmt.range
    );
    return [ new TirBreakStmt( stmt.range ) ];
}