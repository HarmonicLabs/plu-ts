import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { TirProgram } from "../tir/program/TirProgram";

export class TirCompilerCtx
{
    constructor(
        readonly cfg: CompilerOptions,
        readonly program: TirProgram,
    ) {}
}