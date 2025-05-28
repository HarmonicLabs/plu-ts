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

    const entrySource = tirProgram.files.get( tirProgram.entry );
    if( !entrySource )
    throw new Error(
        `TirProgram does not contain entry file ${tirProgram.entry}`
    );

    const main = entrySource.statements.find( isMainFunction );
    if( !main )
    throw new Error(
        `entry file does not have a main function`
    );

    return compileTirFuncExpr( ctx, main.expr );
}