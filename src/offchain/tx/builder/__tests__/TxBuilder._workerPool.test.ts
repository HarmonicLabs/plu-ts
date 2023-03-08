import { Cbor } from "../../../../cbor/Cbor";
import { compile, data, int, lam, pfn, pif, pmakeUnit, precursive, punIData, unit } from "../../../../onchain";
import { UPLCConst } from "../../../../onchain/UPLC/UPLCTerms/UPLCConst";
import { WorkerPool } from "../../../../worker-pool/WorkerPool";
import { costModelsToCborObj, defaultV2Costs } from "../../../ledger";
import { Script, ScriptType } from "../../../script";

const _workerPool = new WorkerPool("./src/offchain/tx/builder/rollup-out/buildWorker.js");

const costsBytes = Cbor.encode(
    costModelsToCborObj({
        PlutusScriptV2: defaultV2Costs
    }) 
).toBuffer();

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

    });
    
    describe("prepareCEK", () => {

        test("resolves", async () => {

            let createdNew = await _workerPool.run({
                method: "prepareCEK",
                args: [ costsBytes ]
            }, 0);

            expect(
                createdNew
            ).toBe( true );

        })

        test("creates once", async () => {

            await _workerPool.terminateAll()

            let createdNew = await _workerPool.run({
                method: "prepareCEK",
                args: [ costsBytes ]
            }, 0);

            expect(
                createdNew
            ).toBe( true );

            createdNew = await _workerPool.run({
                method: "prepareCEK",
                args: [ costsBytes ]
            }, 0);

            expect(
                createdNew
            ).toBe( false );

        });

    });

    describe("evalScript", () => {

        test("resolves", async () => {

            const prepareCEKPromise = _workerPool.run({
                method: "prepareCEK",
                args: [ costsBytes ]
            }, 0);

            const myScript = new Script(
                ScriptType.PlutusV2,
                compile(
                    pfn([
                        data,
                        data
                    ],  unit)
                    (( _a, _b ) => pmakeUnit())
                )
            );
    
            await prepareCEKPromise;

            const evalResult = await _workerPool.run({
                method: "evalScript",
                args: [
                    {
                        bytes: myScript.bytes,
                        hash: myScript.hash.toString(),
                    },
                    [
                        new Uint8Array([1]),
                        new Uint8Array([1])
                    ]
                ]
            }, 0);

            expect(
                evalResult.result
            ).toEqual(
                UPLCConst.unit
            );

        });

        test.skip("same script takes less", async () => {

            const prepareCEKPromise = _workerPool.run({
                method: "prepareCEK",
                args: [ costsBytes ]
            }, 0);

            // we need something more complex to deserialize
            const myScript = new Script(
                ScriptType.PlutusV2,
                compile(
                    pfn([
                        data,
                        data
                    ],  int)
                    (( nData, _b ) =>
                        precursive(
                            pfn([
                                lam( int, int ),
                                int
                            ],  int)
                            (( self, n ) =>
                                pif( int ).$( n.ltEq( 1 ) )
                                .then( 1 )
                                .else(
                                    n.mult( self.$( n.sub(1) ) )
                                )
                            )
                        ).$(
                            punIData.$( nData )
                        )
                    )
                )
            );
    
            await prepareCEKPromise;

            /*
            `new Uint8Array([24, 100])` is the CBOR for the number `100`

            we need a number big enough so that if the garbage collector 
            gets in the way while evaluating doesn't affect the test 
            */

            const t0 = performance.now();

            const res1 = await _workerPool.run({
                method: "evalScript",
                args: [
                    {
                        bytes: myScript.bytes,
                        hash: myScript.hash.toString(),
                    },
                    [
                        new Uint8Array([24, 100]),
                        new Uint8Array([24, 100])
                    ]
                ]
            }, 0);

            const t1 = performance.now();

            const res2 = await _workerPool.run({
                method: "evalScript",
                args: [
                    {
                        bytes: myScript.bytes,
                        hash: myScript.hash.toString(),
                    },
                    [
                        new Uint8Array([24, 100]),
                        new Uint8Array([24, 100])
                    ]
                ]
            }, 0);

            const t2 = performance.now();

            const timeFst = t1 - t0;
            const timeSnd = t2 - t1;

            expect(
                timeFst
            ).toBeGreaterThan(
                timeSnd
            )

            //*
            expect(
                res1
            ).toEqual(
                res2
            )
            //*/

        })

    });

})