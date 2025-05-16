import { scriptContext_t, void_t } from "../../tir/program/stdScope/stdScope";
import { TirFuncDecl } from "../../tir/statements/TirFuncDecl";
import { TirStmt } from "../../tir/statements/TirStmt";
import { TirSimpleVarDecl } from "../../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { canAssignTo } from "../../tir/types/utils/canAssignTo";

export function isMainFunction( stmt: TirStmt ): stmt is TirFuncDecl
{
    if(!(
        stmt instanceof TirFuncDecl
        && stmt.expr.name === "main"
    )) return false;

    const params = stmt.expr.params;
    if(!(
        Array.isArray( params )
        && params.length > 0
        && params.every( p => p instanceof TirSimpleVarDecl )
    )) return false;

    const lastParam = params[ params.length - 1 ];
    const returnType = stmt.expr.returnType;

    return (
        canAssignTo( lastParam.type, scriptContext_t )
        && canAssignTo( returnType, void_t )
    );
}