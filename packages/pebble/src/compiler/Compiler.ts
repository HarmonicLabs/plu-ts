import { compileUPLC, prettyUPLC, UPLCProgram } from "@harmoniclabs/uplc";
import { DiagnosticEmitter } from "../diagnostics/DiagnosticEmitter"
import { DiagnosticMessage } from "../diagnostics/DiagnosticMessage";
import { compileIRToUPLC } from "../IR";
import { CompilerOptions, defaultOptions } from "../IR/toUPLC/CompilerOptions";
import { AstCompiler } from "./AstCompiler/AstCompiler";
import { CompilerIoApi, createMemoryCompilerIoApi } from "./io/CompilerIoApi";
import { compileTypedProgram } from "./TirCompiler/compileTirProgram";
import { toHex } from "@harmoniclabs/uint8array-utils";

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
            while( msg = this.diagnostics.shift()! ) {
                this.io.stdout.write( msg.toString() + "\n" );
            }
            throw new Error("compilation failed");
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
        return;
    }
}