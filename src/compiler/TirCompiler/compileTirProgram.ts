import { IRTerm } from "../../IR";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { TirProgram } from "../tir/program/TirProgram";

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
    return {} as IRTerm;
}