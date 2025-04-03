import { UsingStmt } from "../../../../ast/nodes/statements/UsingStmt";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { getStructType } from "../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileConcreteTypeExpr } from "../types/_compileConcreteTypeExpr";

/**
 * `using` only introduces symbols in scope
 * 
 * we don't represent `using` statements in the TIR
 * 
 * @returns {[]} an empty array if successful compilation
 * @returns {undefined} `undefined` if compilation failed
**/
export function _compileUsingStmt(
    ctx: AstCompilationCtx,
    stmt: UsingStmt
): [] | undefined
{
    stmt.constructorNames;
    stmt.structTypeExpr;
    stmt.range;

    const structOrAliasType = _compileConcreteTypeExpr( ctx, stmt.structTypeExpr );
    if( !structOrAliasType ) return undefined;

    // un-alias
    const structType = getStructType( structOrAliasType );
    if( !structType || !structType.isConcrete() ) return ctx.error(
        DiagnosticCode.Type_0_does_not_have_constructors,
        stmt.structTypeExpr.range, structOrAliasType.toString()
    );

    const defCtorNames = structType.constructors.map( c => c.name );
    const sameStmtCtorNames: string[] = [];

    for( const stmtCtor of stmt.constructorNames )
    {
        const stmtCtorNameId = stmtCtor.constructorName;
        const stmtCtorName = stmtCtorNameId.text;
        const stmtReassignedCtorName = stmtCtor.renamedConstructorName;

        if( !defCtorNames.includes( stmtCtorName ) ) return ctx.error(
            DiagnosticCode.Constructor_0_is_not_part_of_the_definition_of_1,
            stmtCtorNameId.range, stmtCtorName, structType.toString(),
        );
        if( sameStmtCtorNames.includes( stmtCtorName ) ) return ctx.error(
            DiagnosticCode.Constructor_0_was_already_specified,
            stmtCtorNameId.range, stmtCtorName
        );
        sameStmtCtorNames.push( stmtCtorName );

        const valid = ctx.scope.defineAviableConstructorIfValid(
            stmtReassignedCtorName?.text ?? stmtCtorName,
            stmtCtorName,
            structOrAliasType
        );
        if( !valid )
        return ctx.error(
            DiagnosticCode.Constructor_name_0_is_already_declared_in_this_scope,
            stmtCtorNameId.range, stmtCtorName
        );
    }

    return [];
}