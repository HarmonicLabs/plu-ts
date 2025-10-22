import { IRTerm } from "../../IR";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { ToIRTermCtx } from "../tir/expressions/ToIRTermCtx";
import { TypedProgram } from "../tir/program/TypedProgram";
import { expressify } from "./expressify/expressify";
import { TirCompilerCtx } from "./TirCompilerCtx";

/**
 * compiles Typed IR to IRTerm (old plu-ts IR).
 * 
 * TIR -> IRTerm
 */
export function compileTypedProgram(
    cfg: CompilerOptions,
    tirProgram: TypedProgram
): IRTerm
{
    /*
    const ctx = new TirCompilerCtx(
        cfg,
        tirProgram,
    );
    //*/
    const mainFuncExpr = tirProgram.getMainOrThrow()
    // console.log("main func expr:", mainFuncExpr.toString() );
    void expressify(
        mainFuncExpr,
        undefined, // loopReplacements
        tirProgram
    );
    return mainFuncExpr.toIR( ToIRTermCtx.root() );
}