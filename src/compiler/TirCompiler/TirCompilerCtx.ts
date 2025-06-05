import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { TypedProgram } from "../tir/program/TypedProgram";

export class TirCompilerCtx
{
    constructor(
        readonly cfg: CompilerOptions,
        readonly program: TypedProgram,
    ) {}
}