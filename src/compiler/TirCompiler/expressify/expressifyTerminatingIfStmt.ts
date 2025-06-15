import { TirExpr } from "../../tir/expressions/TirExpr";
import { TirTernaryExpr } from "../../tir/expressions/TirTernaryExpr";
import { TirBlockStmt } from "../../tir/statements/TirBlockStmt";
import { TirIfStmt } from "../../tir/statements/TirIfStmt";
import { expressifyFuncBody, LoopReplacements } from "./expressify";
import { ExpressifyCtx } from "./ExpressifyCtx";
import { expressifyVars } from "./expressifyVars";

export function expressifyTerminatingIfStmt(
    parentCtx: ExpressifyCtx,
    stmt: TirIfStmt,
    loopReplacements: LoopReplacements | undefined
): TirExpr
{
    if( !stmt.elseBranch ) throw new Error(
        "Terminating if statement must have an else branch."
    );

    const thenBranch = stmt.thenBranch instanceof TirBlockStmt ?
        stmt.thenBranch.stmts.slice() :
        [ stmt.thenBranch ];

    const elseBranch = stmt.elseBranch instanceof TirBlockStmt ?
        stmt.elseBranch.stmts.slice() : 
        [ stmt.elseBranch ]

    return new TirTernaryExpr(
        expressifyVars( parentCtx, stmt.condition, loopReplacements ),
        expressifyFuncBody( parentCtx.newChild(), thenBranch, loopReplacements ),
        expressifyFuncBody( parentCtx.newChild(), elseBranch, loopReplacements ),
        parentCtx.returnType,
        stmt.range
    );
}