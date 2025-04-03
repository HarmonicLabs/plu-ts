import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirSource } from "../../../tir/program/TirSource";
import { TirArrayLikeDeconstr } from "../../../tir/statements/TirVarDecl/TirArrayLikeDeconstr";
import { TirNamedDeconstructVarDecl } from "../../../tir/statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { TirSimpleVarDecl } from "../../../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { TirSingleDeconstructVarDecl } from "../../../tir/statements/TirVarDecl/TirSingleDeconstructVarDecl";
import { TirVarDecl } from "../../../tir/statements/TirVarDecl/TirVarDecl";
import { AstCompilationCtx } from "../../AstCompilationCtx";

export function _handleExportStmtVarDecl(
    ctx: AstCompilationCtx,
    decl: TirVarDecl,
    tirSource: TirSource
): void
{
    if( decl instanceof TirSimpleVarDecl )
    {
        if( !tirSource.exportValue( decl.name ) ) ctx.error(
            DiagnosticCode._0_is_already_exported,
            decl.range, decl.name
        );
    }
    else if(
        decl instanceof TirNamedDeconstructVarDecl
        || decl instanceof TirSingleDeconstructVarDecl
    )
    {
        for( const innerDecl of decl.fields.values() )
            _handleExportStmtVarDecl( ctx, innerDecl, tirSource );

        if(
            typeof decl.rest === "string"
            && !tirSource.exportValue( decl.rest )
        ) ctx.error(
            DiagnosticCode._0_is_already_exported,
            decl.range, decl.rest
        );
    }
    else if( decl instanceof TirArrayLikeDeconstr )
    {
        for( const innerDecl of decl.elements )
            _handleExportStmtVarDecl( ctx, innerDecl, tirSource );

        if(
            typeof decl.rest === "string"
            && !tirSource.exportValue( decl.rest )
        ) ctx.error(
            DiagnosticCode._0_is_already_exported,
            decl.range, decl.rest
        );
    }
}