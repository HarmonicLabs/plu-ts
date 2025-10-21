import { TirLettedExpr } from "../../tir/expressions/TirLettedExpr";
import { TirVariableAccessExpr } from "../../tir/expressions/TirVariableAccessExpr";
import { TirArrayLikeDeconstr } from "../../tir/statements/TirVarDecl/TirArrayLikeDeconstr";
import { TirNamedDeconstructVarDecl } from "../../tir/statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { TirSimpleVarDecl } from "../../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { TirSingleDeconstructVarDecl } from "../../tir/statements/TirVarDecl/TirSingleDeconstructVarDecl";
import { TirVarDecl } from "../../tir/statements/TirVarDecl/TirVarDecl";
import { ExpressifyCtx } from "./ExpressifyCtx";
import { expressifyVars } from "./expressifyVars";


export function expressifyVarDecl(
    ctx: ExpressifyCtx,
    stmt: TirVarDecl
): void
{
    const isConst = stmt.isConst;
    console.log("expressifyVarDecl", stmt);

    if( stmt.initExpr ) expressifyVars( ctx, stmt.initExpr );

    if(
        stmt instanceof TirSimpleVarDecl
    ) {
        if( stmt.isConst ) {
            void ctx.variables.set( stmt.name, { latestName: stmt.name } );
            /// @ts-ignore Cannot assign to 'isConst' because it is a read-only property.
            stmt.isConst = true;
        }
        ctx.lettedConstants.set(
            stmt.name,
            new TirLettedExpr(
                stmt.name,
                stmt.initExpr!,
                stmt.range
            )
        );
    }
    if(
        stmt instanceof TirNamedDeconstructVarDecl
        || stmt instanceof TirSingleDeconstructVarDecl
    ) {
        for( const [ _field, varDecl ] of stmt.fields ) expressifyVarDecl( ctx, varDecl );
        if( stmt.rest ) ctx.variables.set( stmt.rest, { latestName: stmt.rest } );
        return;
    }
    if( stmt instanceof TirArrayLikeDeconstr ) {
        for( const varDecl of stmt.elements ) expressifyVarDecl( ctx, varDecl );
        if( stmt.rest ) ctx.variables.set( stmt.rest, { latestName: stmt.rest } );
        return;
    }
}