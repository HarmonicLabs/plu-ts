import { defaultProtocolParameters, Address, UTxO, Value, TxOutRef, TxOut } from "@harmoniclabs/cardano-ledger-ts";
import { TxBuilder } from "../TxBuilder"


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

    test("assert min out lovelaces", () => {

        expect(
            () => {
                txBuilder.buildSync({
                    inputs: [
                        {
                            utxo: new UTxO({
                                utxoRef: TxOutRef.fake,
                                resolved: new TxOut({
                                    address: Address.fake,
                                    value: Value.lovelaces( 10_000_000 )
                                })
                            })
                        }
                    ],
                    outputs: [
                        {
                            address: Address.fake,
                            value: Value.zero
                        }
                    ],
                    changeAddress: Address.fake
                });
            }
        ).toThrow()

        expect(
            () => {
                txBuilder.buildSync({
                    inputs: [
                        {
                            utxo: new UTxO({
                                utxoRef: TxOutRef.fake,
                                resolved: new TxOut({
                                    address: Address.fake,
                                    value: Value.lovelaces( 10_000_000 )
                                })
                            })
                        }
                    ],
                    outputs: [
                        {
                            address: Address.fake,
                            value: Value.lovelaces( 1_500_000 )
                        }
                    ],
                    changeAddress: Address.fake
                });
            }
        ).not.toThrow()
    })

})

/*
jest.setTimeout(2_000_000)

const txBuilder = new TxBuilder(
    "testnet",
    defaultProtocolParameters
)

const pkAddr = new Address(
    "testnet",
    new Credential(
        "pubKey",
        new PubKeyHash( "1b372f69".repeat(7) )
    )
)

const succeedScript = new Script(
    ScriptType.PlutusV2,
    Cbor.encode(
        new CborBytes(
            Cbor.encode(
                new CborBytes(

                    compile(
                        pfn([
                            data,
                            data,
                            V2.PScriptContext.type
                        ],  unit)
                        (( dat, rdmr, ctx) => pmakeUnit() )
                    )
                    
                )
            ).toBuffer()
        )
    ).toBuffer()
);

const succeedScriptAddr = new Address(
    "testnet",
    new Credential(
        "script",
        succeedScript.hash
    )
)

describe("TxBuilder.build", () => {

    test("simple pub key input", async () => {

        const tx = await txBuilder.build({
            inputs: [
                {
                    utxo: new UTxO({
                        utxoRef: {
                            id: "ff".repeat(32),
                            index: 0
                        },
                        resolved: {
                            address: pkAddr,
                            value: Value.lovelaces( 10_000_000 )
                        }
                    })
                }
            ],
            changeAddress: pkAddr
        });

        expect( getNSignersNeeded( tx.body ) ).toEqual( 1 );
        
    });

    describe("simple spend script", () => {

        test("fails on missing script", async () => {

            let rejected = false;

            await txBuilder.build({
                inputs: [
                    {
                        utxo: new UTxO({
                            utxoRef: {
                                id: "ff".repeat(32),
                                index: 0
                            },
                            resolved: {
                                address: succeedScriptAddr,
                                value: Value.lovelaces( 10_000_000 )
                            }
                        })
                    }
                ],
                changeAddress: pkAddr
            }).catch( _ => rejected = true )

            expect( rejected ).toBe( true );
    
        });

        test("script included in transaction", async () => {

            const tx = await txBuilder.build({
                inputs: [
                    {
                        utxo: new UTxO({
                            utxoRef: {
                                id: "ff".repeat(32),
                                index: 0
                            },
                            resolved: {
                                address: succeedScriptAddr,
                                value: Value.lovelaces( 10_000_000 ),
                                datum: new DataConstr( 0, [] )
                            }
                        }),
                        inputScript: {
                            datum: "inline",
                            redeemer: new DataConstr( 0, [] ),
                            script: succeedScript
                        }
                    }
                ],
                changeAddress: pkAddr
            });

        });

        test("script included in transaction as reference script", async () => {

            const tx = await txBuilder.build({
                inputs: [
                    {
                        utxo: new UTxO({
                            utxoRef: {
                                id: "ff".repeat(32),
                                index: 0
                            },
                            resolved: {
                                address: succeedScriptAddr,
                                value: Value.lovelaces( 10_000_000 ),
                                datum: new DataConstr( 0, [] )
                            }
                        }),
                        referenceScriptV2: {
                            datum: "inline",
                            redeemer: new DataConstr( 0, [] ),
                            refUtxo: new UTxO({
                                utxoRef: {
                                    id: "ff".repeat(32),
                                    index: 0
                                },
                                resolved: {
                                    address: succeedScriptAddr,
                                    value: Value.lovelaces( 10_000_000 ),
                                    refScript: succeedScript
                                }
                            })
                        }
                    }
                ],
                changeAddress: pkAddr
            });

        });

        test("inline datum specified but none present", async () => {

            let rejected = false;
            // script in transaciton
            await txBuilder.build({
                inputs: [
                    {
                        utxo: new UTxO({
                            utxoRef: {
                                id: "ff".repeat(32),
                                index: 0
                            },
                            resolved: {
                                address: succeedScriptAddr,
                                value: Value.lovelaces( 10_000_000 ),
                                // datum: new DataConstr( 0, [] )
                            }
                        }),
                        inputScript: {
                            script: succeedScript,
                            datum: "inline",
                            redeemer: new DataConstr( 0, [] )
                        }
                    }
                ],
                changeAddress: pkAddr
            }).catch( _ => rejected = true )

            expect( rejected ).toBe( true );

            rejected = false;

            // reference script
            await txBuilder.build({
                inputs: [
                    {
                        utxo: new UTxO({
                            utxoRef: {
                                id: "ff".repeat(32),
                                index: 0
                            },
                            resolved: {
                                address: succeedScriptAddr,
                                value: Value.lovelaces( 10_000_000 ),
                                // datum: new DataConstr( 0, [] )
                            }
                        }),
                        referenceScriptV2: {
                            datum: "inline",
                            redeemer: new DataConstr( 0, [] ),
                            refUtxo: new UTxO({
                                utxoRef: {
                                    id: "ff".repeat(32),
                                    index: 0
                                },
                                resolved: {
                                    address: pkAddr,                // doesn't matter
                                    value: Value.lovelaces( 0 ),   // doesn't matter
                                    refScript: succeedScript
                                }
                            })
                        }
                    }
                ],
                changeAddress: pkAddr
            }).catch( _ => rejected = true )

            expect( rejected ).toBe( true );

        });

    });

    const pfactorial = precursive(
        pfn([
            lam( int, int ),
            int
        ],  int)
        (( self, n ) =>
            pif( int ).$( n.lt( 2 ) )
            .then( 1 )
            .else(
                n.mult( self.$( n.sub(1) ) )
            )
        )
    );

    const onlyBigThirdElem = pfn([
        data,
        list( int ),
        PScriptContext.type
    ],  bool)
    (( _dat, nums, _ctx ) => 
        nums.at(0).ltEq( (BigInt(1) << BigInt(64)) - BigInt(1) )
    )

    const mintSomething = pfn([
        data,
        PScriptContext.type
    ],  bool)
    (( _rdmr, ctx ) => {

        ctx.tx.inputs.length.gtEq( 2 )

        return ctx.extract("tx").in(({ tx }) => 
        tx.extract("inputs").in(({ inputs }) => 
            inputs.length.gtEq(2) 
        ))
    });

    const onlyBigThirdScript = new Script(
        ScriptType.PlutusV2,
        compile(
            makeValidator(
                onlyBigThirdElem,
                "a"
            )
        )
    );

    const onlyBigThirdAddr = new Address(
        "mainnet",
        new Credential(
            "script",
            onlyBigThirdScript.hash
        )
    );

    const mintSomethingScript = new Script(
        ScriptType.PlutusV2,
        compile(
            makeRedeemerValidator(
                mintSomething
            )
        )
    );

    describe("big fat transactions", () => {

        let tx!: Tx;
        test("two scripts", async () => {

            const nums = [
                (BigInt(1) << BigInt(64)) - BigInt(1),
                BigInt( 1 ),
                BigInt( 1 )
            ];

            // console.log( showIR( onlyBigThirdElem.toIR() ) )

            // console.log(
            //     Machine.evalSimple(
            //         pInt( nums[0] ).gt(
            //             pfactorial.$(
            //                 nums[1] + nums[2]
            //             )
            //         )
            //     ),
            //     nums
            // )

            // for( let i = 0; i < 5; i++ )
            tx = await txBuilder.build({
                inputs: [
                    {
                        utxo: new UTxO({
                            utxoRef: {
                                id: "ff".repeat(32),
                                index: 0
                            },
                            resolved: {
                                address: onlyBigThirdAddr,
                                value: Value.lovelaces( 10_000_000 ),
                                datum: new DataConstr( 0, [] )
                            }
                        }),
                        inputScript: {
                            datum: "inline",
                            redeemer: new DataList([
                                new DataI( 2 ),
                                new DataI( 3 ),
                                new DataI( (BigInt(1) << BigInt(64)) - BigInt(1) ),
                            ]),
                            script: onlyBigThirdScript
                        }
                    },
                    {
                        utxo: new UTxO({
                            utxoRef: {
                                id: "aa".repeat(32),
                                index: 0
                            },
                            resolved: {
                                address: Address.fake,
                                value: Value.lovelaces( 10_000_000 ),
                                datum: new DataConstr( 0, [] )
                            }
                        }),
                    }
                ],
                mints: [
                    {
                        value: new Value([
                            {
                                policy: mintSomethingScript.hash,
                                assets: [
                                    {
                                        name: fromAscii("hello"),
                                        quantity: 2
                                    }
                                ]
                            }
                        ]),
                        script: {
                            inline: mintSomethingScript,
                            policyId: mintSomethingScript.hash,
                            redeemer: new DataI(0)
                        }
                    }
                ],
                changeAddress: pkAddr
            });

        });


    })
})
*/