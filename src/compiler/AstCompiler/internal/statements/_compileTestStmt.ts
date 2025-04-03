import { TestStmt } from "../../../../ast/nodes/statements/TestStmt";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirBlockStmt } from "../../../tir/statements/TirBlockStmt";
import { TirTestStmt } from "../../../tir/statements/TirTestStmt";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { wrapManyStatements } from "../../utils/wrapManyStatementsOrReturnSame";
import { _compileStatement } from "./_compileStatement";

export function _compileTestStmt(
    ctx: AstCompilationCtx,
    stmt: TestStmt
): [ TirTestStmt ] | undefined
{
    if( ctx.functionCtx ) return ctx.error(
        DiagnosticCode.A_test_statement_can_only_be_used_outside_a_function,
        stmt.range
    );

    let tirBody = wrapManyStatements(
        _compileStatement(
            ctx.newBranchChildScope(),
            stmt.body
        ),
        stmt.body.range
    );
    if( !tirBody ) return undefined;
    if(!( tirBody instanceof TirBlockStmt))
    {
        tirBody = new TirBlockStmt( [ tirBody ], stmt.body.range );
    }

    return [ new TirTestStmt(
        stmt.testName?.string,
        tirBody as TirBlockStmt,
        stmt.range
    ) ];
}