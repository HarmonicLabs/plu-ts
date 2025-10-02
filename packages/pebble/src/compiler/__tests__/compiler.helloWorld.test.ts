import { defaultOptions } from "../../IR/toUPLC/CompilerOptions";
import { createMemoryCompilerIoApi } from "../io/CompilerIoApi";
import { Compiler } from "../Compiler";
import { fromUtf8, toHex } from "@harmoniclabs/uint8array-utils";
import { parseUPLC, prettyUPLC } from "@harmoniclabs/uplc";

describe("parseMain", () => {
    test("multi prop access", async () => {

        const fileName = "test.pebble";
        const srcText = `
struct HelloWorldDatum
{
    owner: bytes
}

contract HelloWorld
{
    spend helloWorld(
        inputIdx: int,
        outputIdx: int,
        message: bytes
    )
    {
        const { tx, spendingRef } = context;

        const { resolved: spendingInput, ref: inputSpendingRef } = tx.inputs[inputIdx];

        assert inputSpendingRef === spendingRef;

        const InlineDatum{
            datum: {
                owner
            } as HelloWorldDatum
        } = spendingInput.datum;

        assert tx.signatories.includes(owner);

        assert message == "Hello pebble";
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

        console.log( toHex( output ) );
        console.log( prettyUPLC( parseUPLC( output ).body, 2 ) )
    });
    
});