import { DiagnosticEmitter } from "../../diagnostics/DiagnosticEmitter";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { CompilerIoApi, createMemoryCompilerIoApi } from "../io/CompilerIoApi";
import { IPebbleCompiler } from "../IPebbleCompiler";

/**
 * compiles Pebble AST to Functional IR.
 * 
 * AST -> FIR
 */
export class AstCompiler extends DiagnosticEmitter
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