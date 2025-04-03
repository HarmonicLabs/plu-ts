import { AssignmentStmt } from "../../../../ast/nodes/statements/AssignmentStmt";
import { ForStmt } from "../../../../ast/nodes/statements/ForStmt";
import { TirAssignmentStmt } from "../../../tir/statements/TirAssignmentStmt";
import { TirForStmt } from "../../../tir/statements/TirForStmt";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { bool_t } from "../../scope/stdScope/stdScope";
import { wrapManyStatements } from "../../utils/wrapManyStatementsOrReturnSame";
import { _compileExpr } from "../exprs/_compileExpr";
import { _compileAssignmentStmt } from "./_compileAssignmentStmt";
import { _compileStatement } from "./_compileStatement";
import { _compileVarStmt } from "./_compileVarStmt";

export function _compileForStmt(
    ctx: AstCompilationCtx,
    stmt: ForStmt
): [ TirForStmt ] | undefined
{
    const loopScope = ctx.newLoopChildScope();

    const tirInit = stmt.init ? _compileVarStmt( loopScope, stmt.init, false ) : undefined;
    if( !tirInit ) return undefined;

    const tirCond = stmt.condition ? _compileExpr( loopScope, stmt.condition, bool_t ) : undefined;
    if( !tirCond ) return undefined;

    const tirUpdates = _compileForUpdateStmts( loopScope, stmt.updates );
    if( !tirUpdates ) return undefined;

    const tirBody = wrapManyStatements(
        _compileStatement(
            loopScope.newBranchChildScope(),
            stmt.body
        ),
        stmt.body.range
    );
    if( !tirBody ) return undefined;

    return [ new TirForStmt(
        tirInit,
        tirCond,
        tirUpdates,
        tirBody,
        stmt.range
    ) ];
}
export function _compileForUpdateStmts(
    ctx: AstCompilationCtx,
    stmts: AssignmentStmt[]
): TirAssignmentStmt[] | undefined
{
    const tirStmts: TirAssignmentStmt[] = [];
    for( let stmt of stmts )
    {
        const tirStmt = _compileAssignmentStmt( ctx, stmt );
        // empty array here returns undefined
        // that is fine, because an empty array of assignments
        // is not a valid statement
        if( !tirStmt ) return undefined;
        tirStmts.push( ...tirStmt );
    }
    return tirStmts;
}