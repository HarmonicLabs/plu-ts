import { DiagnosticEmitter } from "../../diagnostics/DiagnosticEmitter";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { CompilerIoApi, createMemoryCompilerIoApi } from "../io/CompilerIoApi";
import { IPebbleCompiler } from "../IPebbleCompiler";

/**
 * compiles Typed IR to IRTerm (old plu-ts IR).
 * 
 * TIR -> IRTerm
 */
export class FirCompiler extends DiagnosticEmitter
    implements IPebbleCompiler
{
    constructor(
        readonly cfg: CompilerOptions,
        readonly io: CompilerIoApi = createMemoryCompilerIoApi({ useConsoleAsOutput: true }),
        diagnostics?: DiagnosticMessage[]
    )
    {
        super( diagnostics );
    }
}