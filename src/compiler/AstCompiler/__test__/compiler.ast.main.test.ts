import { Source } from "../../../ast/Source/Source";
import { DiagnosticMessage } from "../../../diagnostics/DiagnosticMessage";
import { defaultOptions } from "../../../IR/toUPLC/CompilerOptions";
import { parseFile } from "../../../parser/parseFile";
import { createMemoryCompilerIoApi } from "../../io/CompilerIoApi";
import { AstCompiler } from "../AstCompiler";



describe("parseMain", () => {

    test("parseMain", async () => {
    
        const fileName = "test.pebble";
        const srcText = `
function main({ tx, purpose }: ScriptContext ): void
{
    const [ a, b, ...rest ] = tx.inputs;

    const Spend{
        ref, 
        optionalDatum: datum
        // Type 'Optional<data>' is not assignable to type 'Struct'.
        // Just{ 
        //     value: datum
        // }
    } = purpose;

    const sumLove = 0;

    for( const { resolved: input } of tx.inputs )
    {
        // TODO: add implementation on value
        // Property 'lovelaces' does not exist on type 'Value'
        // sumLove += input.value.lovelaces();
        sumLove += tx.fee;
    }

    assert tx.outputs.length() === 1 else "only one output allowed";
    assert sumLove >= 1000_000_000;
}
        `;

        const complier = new AstCompiler(
            fileName,
            defaultOptions,
            "/",
            createMemoryCompilerIoApi({
                sources: new Map([
                    [fileName, srcText],
                ]),
                useConsoleAsOutput: true,
            }),
        );
    
        const diagnostics = await complier.compileFile( fileName );

        console.log( diagnostics.map( d => d.toString() ) );
    });
    
});