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
    const latestVarNameSSA = ctx.variables.get( originalName );
    if( !latestVarNameSSA ) {
        throw new Error("re-assigning constant variable");
    }

    const newUniqueName = getUniqueInternalName( originalName );
    latestVarNameSSA.latestName = newUniqueName;

    // point to the same object
    ctx.variables.set( newUniqueName, latestVarNameSSA );
    ctx.lettedConstants.set(
        newUniqueName,
        new TirLettedExpr(
            newUniqueName,
            assignedExpr,
            stmt.range
        )
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