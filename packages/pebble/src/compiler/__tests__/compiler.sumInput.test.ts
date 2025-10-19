import { defaultOptions } from "../../IR/toUPLC/CompilerOptions";
import { createMemoryCompilerIoApi } from "../io/CompilerIoApi";
import { Compiler } from "../Compiler";
import { fromUtf8, toHex } from "@harmoniclabs/uint8array-utils";
import { parseUPLC, prettyUPLC } from "@harmoniclabs/uplc";

describe("parseMain", () => {
    test("parseMain", async () => {

        const fileName = "test.pebble";
        const srcText = `
contract SumInputLove {
    spend rememberTotInput() {
        const { tx } = context;

        let totalInput = 0;
        for( const { resolved: input } of tx.inputs ) {
            totalInput += input.value.lovelaces();
        }

        const InlineDatum{ datum } = tx.outputs[0].datum;

        assert (datum as int) === totalInput;
    }
}
        `;

        const ioApi = createMemoryCompilerIoApi({
            sources: new Map([
                [fileName, fromUtf8(srcText)],
            ]),
            useConsoleAsOutput: true,
        });
        const complier = new Compiler( ioApi );
    
        await complier.compile({ entry: fileName, root: "/" });
        const diagnostics = complier.diagnostics;

        // console.log( diagnostics );
        // console.log( diagnostics.map( d => d.toString() ) );
        expect( diagnostics.length ).toBe( 0 );

        const output = ioApi.outputs.get("out/out.flat")!;
        expect( output instanceof Uint8Array ).toBe( true );

        // console.log( toHex( output ) );
        // console.log( prettyUPLC( parseUPLC( output ).body, 2 ) )
    });
    
});