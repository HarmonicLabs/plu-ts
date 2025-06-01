import { IRTerm } from "../../IR";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { TirProgram } from "../tir/program/TirProgram";
import { compileTirFuncExpr } from "./internal/compileTirFuncExpr";
import { TirCompilerCtx } from "./TirCompilerCtx";

/**
 * compiles Typed IR to IRTerm (old plu-ts IR).
 * 
 * TIR -> IRTerm
 */
export function compileTirProgram(
    cfg: CompilerOptions,
    tirProgram: TirProgram
): IRTerm
{
    const ctx = new TirCompilerCtx(
        cfg,
        tirProgram,
    );

    return {} as IRTerm;
}