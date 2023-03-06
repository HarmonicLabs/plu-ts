import { WorkerPool } from "../../../../worker-pool/WorkerPool";
import { Hash28 } from "../../../hashes/Hash28/Hash28";
import { Value } from "../../../ledger/Value/Value";

jest.setTimeout(100_000);

const _workerPool = new WorkerPool("./src/offchain/tx/builder/rollup-out/buildWorker.js");

afterAll(async () => {
    await _workerPool.terminateAll()
})

describe("TxBuilder :: _workerPool", () => {

    test("unknown method", async () => {

        let threw = false;
        try {
            await _workerPool.run({
                method: "this_doesnt_exsists",
                args: []
            });
        } catch { threw = true };

        expect( threw ).toBe( true )

        await _workerPool.terminateAll()

    });

    describe("addValues", () => {

        test.only("add two", async () => {

            const cborValues = [
                Value.lovelaces( 2000000 ),
                new Value([
                    {
                        policy: "", assets: { "": 2000000 }
                    },
                    {
                        policy: new Hash28( "ff".repeat(28) ),
                        assets: { hello: 2 }
                    }
                ])
            ].map( v => v.toCbor().toString() )
            const wresult = await _workerPool.run({
                method: "addValues",
                args: cborValues
            });

            console.log("worker result",wresult)
            
            const result = Value.fromCbor( wresult.data );

            console.log(
                JSON.stringify(
                    result.toJson(),
                    undefined,
                    2
                )
            )

        })
    })
    
})