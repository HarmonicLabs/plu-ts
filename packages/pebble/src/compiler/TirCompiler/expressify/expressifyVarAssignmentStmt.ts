import { getUniqueInternalName } from "../../internalVar";
import { TirLettedExpr } from "../../tir/expressions/TirLettedExpr";
import { TirAssignmentStmt } from "../../tir/statements/TirAssignmentStmt";
import { TirSimpleVarDecl } from "../../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { ExpressifyCtx } from "./ExpressifyCtx";
import { expressifyVars } from "./expressifyVars";

export function expressifyVarAssignmentStmt(
    ctx: ExpressifyCtx,
    stmt: TirAssignmentStmt
): TirSimpleVarDecl
{
    const assignedExpr = expressifyVars( ctx, stmt.assignedExpr );

    const originalName = stmt.varIdentifier.resolvedValue.variableInfos.name;
    const latestVarNameSSA = ctx.getVariableSSA( originalName );
    if( !latestVarNameSSA ) {
        console.log( originalName, ctx.allVariablesNoLetted() );
        throw new Error("re-assigning constant variable '" + originalName + "'");
    }

    const newUniqueName = getUniqueInternalName( originalName );
    ctx.setNewVariableName( originalName, newUniqueName );
    // point to the same object
    ctx.introduceLettedConstant(
        newUniqueName,
        assignedExpr,
        stmt.range
    );
    
    // will replace re-assignment in body
    return new TirSimpleVarDecl(
        newUniqueName,
        stmt.varIdentifier.resolvedValue.variableInfos.type,
        assignedExpr,
        true, // isConst
        stmt.range,
    );
}