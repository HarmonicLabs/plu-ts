import { DiagnosticEmitter } from "../../diagnostics/DiagnosticEmitter";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { CompilerIoApi, createMemoryCompilerIoApi } from "../io/CompilerIoApi";
import { IPebbleCompiler } from "../IPebbleCompiler";

/**
 * compiles Pebble AST to Functional IR.
 * 
 * AST -> FIR
 * 
 * The AST is simply the result of tokenization and parsing.
 * 
 * Therefore the AST is only syntactically correct, but not necessarily semantically correct.
 * 
 * During the compilation from AST to FIR,
 * missign types are inferred and the resulting FIR is checked for semantic correctness.
 * 
 * In short, here is where type checking happens.
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

    async compileFile(
        path: string,
        src: string | undefined = undefined,
        isEntry: boolean = true
    )
    {
        // src = src ?? this.io.readFile( path )
    }
}