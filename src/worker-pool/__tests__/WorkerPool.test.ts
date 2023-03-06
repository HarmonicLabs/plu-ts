import { WorkerPool } from "../WorkerPool";

jest.setTimeout(100_000)

const workerPath = "./src/worker-pool/__test_utils__/worker.cjs";

const workerPool = new WorkerPool(workerPath, undefined, 4);

afterAll(done => {
    workerPool.terminateAll()
    .then( done )
})

describe("WorkerPool", () => {

    const sleepTime = 2000;

    test("runs tasks", async () => {

        const start = performance.now();

        const result = await workerPool.run({
            method: "sleep",
            args: [ sleepTime ]
        });

        expect( result.startsWith("slept") ).toBe( true )

        expect(
            performance.now() - start
        ).toBeGreaterThanOrEqual( sleepTime )


    });

    test("runs two tasks", async () => {

        const sleepFst = sleepTime;
        const sleepSnd = sleepTime / 2 ;

        const start = performance.now();

        const fst = workerPool.run({
            method: "sleep",
            args: [ sleepFst ]
        });

        const snd = workerPool.run({
            method: "sleep",
            args: [ sleepSnd ]
        });

        await snd;

        expect(
            performance.now() - start
        ).toBeLessThanOrEqual( sleepSnd * 1.2 )

        await fst;

        expect(
            performance.now() - start
        ).toBeLessThanOrEqual( sleepFst * 1.1 )

    });

    test("runs 4 tasks", async () => {

        const start = performance.now();

        await Promise.all(
            (new Array( 4 ))
            .fill({
                method: "sleep",
                args: [ sleepTime ]
            })
            .map( arg => workerPool.run( arg ) )
        );

        expect(
            performance.now() - start
        ).toBeLessThanOrEqual( sleepTime * 1.1 )

    });

    test("run 4 + 1 tasks", async () => {

        const start = performance.now();

        const results = await Promise.all(
            (new Array( 5 ))
            .fill({
                method: "sleep",
                args: [ sleepTime ]
            })
            .map( arg => workerPool.run( arg ) )
        );

        expect( results.every( str => str.startsWith("slept") ) )

        expect(
            performance.now() - start
        ).toBeGreaterThanOrEqual( sleepTime * 1.9 )

        expect(
            performance.now() - start
        ).toBeLessThanOrEqual( sleepTime * 2.1 )

        expect(
            results.every(
                msg => typeof msg === "string" && msg.startsWith("slept")
            )
        ).toBe( true)

    });

});
