import { AstCompilationCtx } from "../../AstCompilationCtx";
import { void_t } from "../../../tir/program/stdScope/stdScope";
import { _compileExpr } from "../exprs/_compileExpr";

/*
export function _compileExprStmt(
    ctx: AstCompilationCtx,
    stmt: ExprStmt
): [ TirExprStmt ] | undefined
{
    const expr = _compileExpr( ctx, stmt.expr, void_t );
    if( !expr ) return undefined;
    return [ new TirExprStmt( expr, stmt.range ) ];
}
    //*/