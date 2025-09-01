import { BlockStmt } from "../../../../ast/nodes/statements/BlockStmt";
import { TirBlockStmt } from "../../../tir/statements/TirBlockStmt";
import { TirStmt } from "../../../tir/statements/TirStmt";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileStatement } from "./_compileStatement";

export function _compileBlockStmt(
    ctx: AstCompilationCtx,
    stmt: BlockStmt,
): [ TirBlockStmt ] | undefined
{
    const blockCtx = ctx.newBranchChildScope();
    // stmt.stmts;
    const tirStmts: TirStmt[] = [];
    for( const blockStmt of stmt.stmts )
    {
        const tirStmt = _compileStatement( blockCtx, blockStmt );
        if( !Array.isArray( tirStmt ) ) return undefined;
        tirStmts.push( ...tirStmt );
    }
    return [ new TirBlockStmt( tirStmts, stmt.range ) ];
}