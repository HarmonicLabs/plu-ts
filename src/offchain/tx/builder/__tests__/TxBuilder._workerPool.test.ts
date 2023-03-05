import { WorkerPool } from "../../../../worker-pool/WorkerPool";

const _workerPool = new WorkerPool("./src/offchain/tx/builder/rollup-out/buildWorker.js");

afterAll(async () => {
    await _workerPool.terminateAll()
})

describe("TxBuilder :: _workerPool", () => {

    describe("addValues", () => {

        test("simple add", async () => {

            const result = await _workerPool.run({
                method: "addValues",
                args: []
            });

            console.log( result );

        })

    })
    
})