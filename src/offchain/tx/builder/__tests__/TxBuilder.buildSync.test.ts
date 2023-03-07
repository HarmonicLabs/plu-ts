import { Cbor } from "../../../../cbor/Cbor"
import { CborBytes } from "../../../../cbor/CborObj/CborBytes"
import { V2, data, pfn, pmakeUnit, unit } from "../../../../onchain"
import { compile } from "../../../../onchain/pluts/Script/compile"
import { DataConstr } from "../../../../types/Data/DataConstr"
import { PaymentCredentials } from "../../../credentials/PaymentCredentials"
import { PubKeyHash } from "../../../credentials/PubKeyHash"
import { Address } from "../../../ledger/Address"
import { Value } from "../../../ledger/Value/Value"
import { defaultProtocolParameters } from "../../../ledger/protocol/ProtocolParameters"
import { Script, ScriptType } from "../../../script/Script"
import { getNSignersNeeded } from "../../Tx"
import { UTxO } from "../../body/output/UTxO"
import { TxBuilder } from "../TxBuilder"

const txBuilder = new TxBuilder(
    "testnet",
    defaultProtocolParameters
)

const pkAddr = new Address(
    "testnet",
    new PaymentCredentials(
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
    new PaymentCredentials(
        "script",
        succeedScript.hash
    )
) 

describe("TxBuilder.buildSync", () => {

    test("simple pub key input", () => {

        const tx = txBuilder.buildSync({
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

        test("fails on missing script", () => {

            expect(
                () => txBuilder.buildSync({
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
                })
            ).toThrow()
    
        });

        test("script included in transaction", () => {

            const tx = txBuilder.buildSync({
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

        test("script included in transaction as reference script", () => {

            const tx = txBuilder.buildSync({
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

        test("inline datum specified but none present", () => {

            // script in transaciton
            expect( () => 
                txBuilder.buildSync({
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
                })
            ).toThrow()

            // reference script
            expect( () => 
                txBuilder.buildSync({
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
                })
            ).toThrow()

        });

    })
})