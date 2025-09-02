import { defaultOptions } from "../../IR/toUPLC/CompilerOptions";
import { createMemoryCompilerIoApi } from "../io/CompilerIoApi";
import { Compiler } from "../Compiler";
import { fromUtf8, toHex } from "@harmoniclabs/uint8array-utils";



describe("parseMain", () => {

    test("parseMain", async () => {

        const myDatumPath = "my_datum.pebble";
        const myDatumSrc = `
export struct MyDatum {}
`;


        const fileName = "test.pebble";
        const srcText = `
import { MyDatum } from "./${myDatumPath}";

function main( ctx: ScriptContext ): void
{
    return case ctx.purpose
        is Spending{}: void
        is _ : fail;
}
        `;

        const ioApi = createMemoryCompilerIoApi({
            sources: new Map([
                [fileName, fromUtf8(srcText)],
                [myDatumPath, fromUtf8(myDatumSrc)],
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
    });
    
});