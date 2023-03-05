import { WorkerPool } from "../../../../worker-pool/WorkerPool";

const _workerPool = new WorkerPool("../rollup-out/buildWorker.js");

describe("TxBuilder :: _workerPool", () => {

    describe("addValues", () => {

        test("simple add", () => {

            _workerPool.run({
                method: "hello",
                args: []
            })

        })

    })
    
})