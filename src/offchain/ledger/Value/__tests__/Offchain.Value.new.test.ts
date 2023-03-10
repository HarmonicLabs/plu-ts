import { Script, ScriptType } from "../../../script/Script";
import { Value } from "../Value";


describe("new Value", () => {

    test("only TOKEN", () => {

        const mint1 = new Script(
            ScriptType.NativeScript,
            {
                type: "sig",
                keyHash: "ff".repeat(28)
            }
        );
        
        new Value([
            {
                policy: mint1.hash,
                assets: {
                    TOKEN: 1_000_000_000
                }
            }
        ]);
        
    });
})