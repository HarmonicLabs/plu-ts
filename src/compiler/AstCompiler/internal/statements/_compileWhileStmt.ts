import { WhileStmt } from "../../../../ast/nodes/statements/WhileStmt";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirWhileStmt } from "../../../tir/statements/TirWhileStmt";
import { canAssignTo } from "../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { bool_t, any_optional_t } from "../../scope/stdScope/stdScope";
import { wrapManyStatements } from "../../utils/wrapManyStatementsOrReturnSame";
import { _compileExpr } from "../exprs/_compileExpr";
import { _compileStatement } from "./_compileStatement";

export function _compileWhileStmt(
    ctx: AstCompilationCtx,
    stmt: WhileStmt
): [ TirWhileStmt ] | undefined
{
    const tirCond = _compileExpr( ctx, stmt.condition, bool_t );
    if( !tirCond ) return undefined;
    if(
        !canAssignTo( tirCond.type, bool_t )
        && !canAssignTo( tirCond.type, any_optional_t )
    ) return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        stmt.condition.range, tirCond.type.toString(), bool_t.toString()
    );

    const tirBody = wrapManyStatements(
        _compileStatement(
            ctx.newLoopChildScope(),
            stmt.body
        ),
        stmt.body.range
    );
    if( !tirBody ) return undefined;

    return [ new TirWhileStmt(
        tirCond,
        tirBody,
        stmt.range
    ) ];
}