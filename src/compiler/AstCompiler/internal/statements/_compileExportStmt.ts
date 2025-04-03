import { ExportStmt } from "../../../../ast/nodes/statements/ExportStmt";
import { PebbleStmt } from "../../../../ast/nodes/statements/PebbleStmt";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirSource } from "../../../tir/program/TirSource";
import { TirFuncDecl } from "../../../tir/statements/TirFuncDecl";
import { TirStmt } from "../../../tir/statements/TirStmt";
import { isTirVarDecl } from "../../../tir/statements/TirVarDecl/TirVarDecl";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileStatement } from "./_compileStatement";
import { _handleExportStmtVarDecl } from "./_handleExportStmtVarDecl";

export function _compileExportStmt(
    ctx: AstCompilationCtx,
    stmt: ExportStmt,
    tirSource: TirSource | undefined
): TirStmt[] | undefined
{
    // if `tirSource` is not present (and we are not at top level)
    // raise an error but compile the statements normally
    // as if `export` was not present
    if( !tirSource ) ctx.error(
        DiagnosticCode._export_keyword_cannot_be_used_here,
        stmt.range
    );
    const compiledStmts = _compileStatement( ctx, stmt.stmt, undefined );
    if( !Array.isArray( compiledStmts ) ) return undefined;

    if( tirSource )
    for( const compiledStmt of compiledStmts )
    {
        if( compiledStmt instanceof TirFuncDecl ) {
            if( !tirSource.exportValue( compiledStmt.expr.name ) ) ctx.error(
                DiagnosticCode._0_is_already_exported,
                stmt.range, compiledStmt.expr.name
            );
        }
        else if( isTirVarDecl( compiledStmt ) ) _handleExportStmtVarDecl( ctx, compiledStmt, tirSource );
        else ctx.error(
            DiagnosticCode.Only_function_declarations_and_constants_can_be_exported,
            stmt.range
        );
    }

    return compiledStmts;
}