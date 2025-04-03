import { ExprStmt } from "../../../../ast/nodes/statements/ExprStmt";
import { TirExprStmt } from "../../../tir/statements/TirExprStmt";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { void_t } from "../../scope/stdScope/stdScope";
import { _compileExpr } from "../exprs/_compileExpr";

export function _compileExprStmt(
    ctx: AstCompilationCtx,
    stmt: ExprStmt
): [ TirExprStmt ] | undefined
{
    const expr = _compileExpr( ctx, stmt.expr, void_t );
    if( !expr ) return undefined;
    return [ new TirExprStmt( expr, stmt.range ) ];
}