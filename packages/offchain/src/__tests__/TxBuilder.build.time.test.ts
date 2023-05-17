import { defaultProtocolParameters, UTxO, TxOutRef, Address, Value, Script, PaymentCredentials } from "@harmoniclabs/cardano-ledger-ts";
import { DataI } from "@harmoniclabs/plutus-data";
import { TxBuilder } from "../TxBuilder";

describe("build time", () => {

    const txBuilder = new TxBuilder(
        defaultProtocolParameters
    );

    const txBuilderWithGenesis = new TxBuilder(
        defaultProtocolParameters,
        {
            slotLengthInMilliseconds: 1000,
            systemStartPOSIX: (Math.round( Date.now() / 1e3 ) * 1e3) - 1e6
        }
    );

    test("only invalid before results in validityStart", () => {

        const tx = txBuilder.buildSync({
            inputs: [
                { 
                    utxo: new UTxO({
                        utxoRef: TxOutRef.fake,
                        resolved: {
                            address: Address.fake,
                            value: Value.lovelaces(2_000_000)
                        }
                    })
                }
            ],
            invalidBefore: 42,
            changeAddress: Address.fake
        });

        expect( tx.body.validityIntervalStart )
        .not.toBe( undefined );

        expect( tx.body.validityIntervalStart )
        .toBe( 42n );

    });

    test("only invalid after results in validityStart=0 and ttl", () => {

        const tx = txBuilder.buildSync({
            inputs: [
                { 
                    utxo: new UTxO({
                        utxoRef: TxOutRef.fake,
                        resolved: {
                            address: Address.fake,
                            value: Value.lovelaces(2_000_000)
                        }
                    })
                }
            ],
            invalidAfter: 42,
            changeAddress: Address.fake
        });

        expect( tx.body.validityIntervalStart )
        .not.toBe( undefined );

        expect( tx.body.ttl )
        .not.toBe( undefined );

    });

    test("invalid before and invalid after", () => {

        const tx = txBuilder.buildSync({
            inputs: [
                { 
                    utxo: new UTxO({
                        utxoRef: TxOutRef.fake,
                        resolved: {
                            address: Address.fake,
                            value: Value.lovelaces(2_000_000)
                        }
                    })
                }
            ],
            invalidBefore: 42,
            invalidAfter: 69,
            changeAddress: Address.fake
        });

        expect( tx.body.validityIntervalStart )
        .not.toBe( undefined );

        expect( tx.body.validityIntervalStart )
        .toBe( 42n );

        expect( tx.body.ttl )
        .not.toBe( undefined );

        expect( tx.body.ttl )
        .toBe( 69n - 42n );

    });

    test("invalid before > invalid after; fails", () => {

        expect( () => txBuilder.buildSync({
            inputs: [
                { 
                    utxo: new UTxO({
                        utxoRef: TxOutRef.fake,
                        resolved: {
                            address: Address.fake,
                            value: Value.lovelaces(2_000_000)
                        }
                    })
                }
            ],
            invalidBefore: 69,
            invalidAfter: 42,
            changeAddress: Address.fake
        })).toThrow();

    });


    /*
    const simpleScript = new Script(
        "PlutusScriptV2",
        compile(
            pfn([ data, data, PScriptContext.type ], unit )( ( d, r, c ) => pmakeUnit() )
        )
    );
    
    const simpleScriptAddress = Address.mainnet(
        PaymentCredentials.script( 
            simpleScript.hash
        )
    );

    test("tx builder with time and script but no genesis fails", () => {

        expect( () => txBuilder.buildSync({
            inputs: [
                { 
                    utxo: new UTxO({
                        utxoRef: TxOutRef.fake,
                        resolved: {
                            address: simpleScriptAddress,
                            value: Value.lovelaces(2_000_000),
                            datum: new DataI( 0 )
                        }
                    }),
                    inputScript: {
                        script: simpleScript,
                        datum: "inline",
                        redeemer: new DataI( 0 )
                    }
                }
            ],
            invalidBefore: 42,
            invalidAfter: 69,
            changeAddress: Address.fake
        })).toThrow();

    });

    test("tx builder with time and script and genesis is ok", () => {

        expect( () => txBuilderWithGenesis.buildSync({
            inputs: [
                { 
                    utxo: new UTxO({
                        utxoRef: TxOutRef.fake,
                        resolved: {
                            address: simpleScriptAddress,
                            value: Value.lovelaces(2_000_000),
                            datum: new DataI( 0 )
                        }
                    }),
                    inputScript: {
                        script: simpleScript,
                        datum: "inline",
                        redeemer: new DataI( 0 )
                    }
                }
            ],
            invalidBefore: 42,
            invalidAfter: 69,
            changeAddress: Address.fake
        })).not.toThrow();

    });

    test("genesis can be setted", () => {

        const myTxBuilder = new TxBuilder(
            "mainnet",
            defaultProtocolParameters
        );

        const doStuff = () => myTxBuilder.buildSync({
            inputs: [
                { 
                    utxo: new UTxO({
                        utxoRef: TxOutRef.fake,
                        resolved: {
                            address: simpleScriptAddress,
                            value: Value.lovelaces(2_000_000),
                            datum: new DataI( 0 )
                        }
                    }),
                    inputScript: {
                        script: simpleScript,
                        datum: "inline",
                        redeemer: new DataI( 0 )
                    }
                }
            ],
            invalidBefore: 42,
            invalidAfter: 69,
            changeAddress: Address.fake
        })

        expect( doStuff ).toThrow();
        
        myTxBuilder.setGenesisInfos({
            slotLengthInMilliseconds: 1000,
            systemStartPOSIX: (Math.round( Date.now() / 1e3 ) * 1e3) - 1e6
        });

        expect( doStuff ).not.toThrow();

    });
    */

})