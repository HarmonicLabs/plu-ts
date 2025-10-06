import { compileUPLC, prettyUPLC, UPLCProgram } from "@harmoniclabs/uplc";
import { DiagnosticEmitter } from "../diagnostics/DiagnosticEmitter"
import { DiagnosticMessage } from "../diagnostics/DiagnosticMessage";
import { compileIRToUPLC, prettyIR, prettyIRJsonStr } from "../IR";
import { CompilerOptions, defaultOptions } from "../IR/toUPLC/CompilerOptions";
import { AstCompiler } from "./AstCompiler/AstCompiler";
import { CompilerIoApi, createMemoryCompilerIoApi } from "./io/CompilerIoApi";
import { compileTypedProgram } from "./TirCompiler/compileTirProgram";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { __VERY_UNSAFE_FORGET_IRHASH_ONLY_USE_AT_END_OF_UPLC_COMPILATION } from "../IR/IRHash";

export class Compiler
    extends DiagnosticEmitter
{
    constructor(
        readonly io: CompilerIoApi = createMemoryCompilerIoApi({ useConsoleAsOutput: true }),
        readonly cfg: CompilerOptions = defaultOptions,
        diagnostics?: DiagnosticMessage[]
    )
    {
        super( diagnostics );
    }
    
    async compile( config?: Partial<CompilerOptions> ): Promise<void>
    {
        const cfg = {
            ...this.cfg,
            ...config
        };
        const astCompiler = new AstCompiler( cfg, this.io, this.diagnostics );
        const program = await astCompiler.compile();
        if( this.diagnostics.length > 0 ) {
            let msg: DiagnosticMessage;
            globalThis.console && console.log( this.diagnostics );
            const fstErrorMsg = this.diagnostics[0].toString();
            const nDiags = this.diagnostics.length;
            while( msg = this.diagnostics.shift()! ) {
                this.io.stdout.write( msg.toString() + "\n" );
            }
            throw new Error("compilation failed with " + nDiags + " diagnostic messages; first message: " + fstErrorMsg );
        }
        const ir = compileTypedProgram(
            cfg,
            program
        );
        const uplc = compileIRToUPLC( ir );
        const serialized = compileUPLC(
            new UPLCProgram(
                cfg.targetUplcVersion,
                uplc
            )
        ).toBuffer().buffer;

        const outDir = cfg.outDir;
        const outPath = outDir + ( outDir.endsWith("/") ? "" : "/" ) + "out.flat";
        this.io.writeFile( outPath, serialized, cfg.root );
        this.io.stdout.write( `compiled program written to ${outPath}\n` );

        __VERY_UNSAFE_FORGET_IRHASH_ONLY_USE_AT_END_OF_UPLC_COMPILATION();
        return;
    }
}