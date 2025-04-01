function _handleExportStmtVarDecl(
    decl: TirVarDecl,
    tirSource: TirSource
): void
{
    if( decl instanceof TirSimpleVarDecl )
    {
        if( !tirSource.exportValue( decl.name ) ) this.error(
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
            this._handleExportStmtVarDecl( innerDecl, tirSource );

        if(
            typeof decl.rest === "string"
            && !tirSource.exportValue( decl.rest )
        ) this.error(
            DiagnosticCode._0_is_already_exported,
            decl.range, decl.rest
        );
    }
    else if( decl instanceof TirArrayLikeDeconstr )
    {
        for( const innerDecl of decl.elements )
            this._handleExportStmtVarDecl( innerDecl, tirSource );

        if(
            typeof decl.rest === "string"
            && !tirSource.exportValue( decl.rest )
        ) this.error(
            DiagnosticCode._0_is_already_exported,
            decl.range, decl.rest
        );
    }
}