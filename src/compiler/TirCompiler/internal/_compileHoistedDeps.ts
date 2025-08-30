import { TirHoistedExpr } from "../../tir/expressions/TirHoistedExpr";
import { TirNativeFunc } from "../../tir/expressions/TirNativeFunc";
import { TypedProgram } from "../../tir/program/TypedProgram";
import { expressify } from "../expressify/expressify";
import { ExpressifyCtx } from "../expressify/ExpressifyCtx";
import { expressifyVars } from "../expressify/expressifyVars";
import { DepsNode } from "./deps/DepsNode";

export function _compileHoistedDeps(
    program: TypedProgram,
    hoistedMap: Map<string, TirHoistedExpr | TirNativeFunc>,
    deps: string[],
    depsStack: DepsNode
): void
{
    let depName: string;
    if(
        deps.some( dep => depsStack.includes( dep ) )
    ) throw new Error("Circular dependency in hoisted expressions NOT YET IMPLEMENTED");

    while( depName = deps.pop()! )
    {
        const funcDecl = program.functions.get( depName );
        if( funcDecl )
        {
            _compileHoistedDeps(
                program,
                hoistedMap,
                funcDecl.deps(),
                depsStack.getNext( depName )
            );
            const funcExpr = expressify(
                funcDecl,
                undefined, // loopReplacements
                new ExpressifyCtx(
                    undefined,
                    funcDecl.returnType,
                    hoistedMap
                )
            );
            const hoistedExpr = new TirHoistedExpr(
                depName,
                funcDecl
            );
            hoistedMap.set( depName, hoistedExpr );
            continue;
        }

        const constDecl = program.constants.get( depName );
        if( constDecl )
        {
            _compileHoistedDeps(
                program,
                hoistedMap,
                constDecl.deps(),
                depsStack.getNext( depName )
            );
            const expr = expressifyVars(
                new ExpressifyCtx(
                    undefined,
                    constDecl.type,
                    hoistedMap
                ),
                constDecl,
            );
            const hoistedExpr = new TirHoistedExpr(
                depName,
                expr
            );
            hoistedMap.set( depName, hoistedExpr );
            continue;
        }

        throw new Error(
            `Hoisted dependency "${depName}" not found in program`
        );
    }
}