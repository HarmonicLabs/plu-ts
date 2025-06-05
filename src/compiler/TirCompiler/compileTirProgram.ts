import { IRTerm } from "../../IR";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { TypedProgram } from "../tir/program/TypedProgram";
import { compileTirFuncExpr } from "./internal/compileTirFuncExpr";
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
    const ctx = new TirCompilerCtx(
        cfg,
        tirProgram,
    );

    return {} as IRTerm;
}