import { Address, Credential, Script, ScriptType, StakeCredentials, StakeKeyHash, TxBody, TxOutRef, TxRedeemer, UTxO, Value, defaultProtocolParameters, nativeScriptToCbor } from "@harmoniclabs/cardano-ledger-ts";
import { UPLCEncoder, UPLCProgram, parseUPLC, parseUPLCText, showUPLC } from "@harmoniclabs/uplc"
import { ITxBuildInput, TxBuilder, defaultMainnetGenesisInfos } from "..";
import { DataConstr, DataI, dataToCbor } from "@harmoniclabs/plutus-data";
import { getSpendingPurposeData } from "../toOnChain/getSpendingPurposeData";
import { fromAscii, fromHex, fromUtf8, lexCompare } from "@harmoniclabs/uint8array-utils";
import { Machine } from "@harmoniclabs/plutus-machine";


describe("fee", () => {

    const script = new Script(
        ScriptType.PlutusV3,
        fromHex("0101002499")
    );

    const scriptAddr = Address.testnet(
        Credential.script( script.hash )
    );

    const addr0 = Address.fromString("addr_test1qzq55vqf303tduqa0f6r4rmamt2lxw5c98yp5rcyekl6aupgrkxchwfa7uzxtc4sssn4hdp8pdhpe0gvnl3tec8yzjsq5enqa4");

    const txBuilder = new TxBuilder(
        defaultProtocolParameters,
        defaultMainnetGenesisInfos
    );

    
    test("fee", () => {

        const paramUtxo = new UTxO({
            utxoRef: {
                id: "0e626305c5ff451c99ae6f37a39799d6c0c2fc8b20a7d2c1b81fe820e63dcaa4",
                index: 0
            },
            resolved: {
                address: addr0 ,
                value: Value.lovelaces( 10_000_000 )
            }
        });
    

        const mintedSupply = 1000000000000;
        
        let tx = txBuilder.buildSync({
            inputs: [ paramUtxo ],
            mints: [
                {
                    script: {
                        inline: script,
                        redeemer: new DataConstr(0, [])
                    },
                    value: new Value([
                        {
                            policy: script.hash,
                            assets: [
                                {
                                    name: fromAscii("NEWTON_TOT_SUPPLY_NFT"),
                                    quantity: 1
                                },
                                {
                                    name: fromAscii("NEWTON"),
                                    quantity: mintedSupply
                                }
                            ]
                        }
                    ])
                }
            ],outputs: [
                {
                    address: scriptAddr,
                    value: new Value([
                        Value.lovelaceEntry( 2_000_000 ),
                        Value.singleAssetEntry(
                            script.hash,
                            fromAscii("NEWTON_TOT_SUPPLY_NFT"),
                            1
                        )
                    ]),
                    datum: new DataI( mintedSupply )
                }
            ],
            changeAddress: addr0
        });
        
        /*
        console.log(
            ((txBuilder as any).cek as Machine)
            .machineCosts.startup.toJson
        )
        //*/

        /*
        console.log( tx.body.fee );
        console.log( tx.witnesses.redeemers?.at(0)?.toJson() );
        console.log( showUPLC( parseUPLC( fromHex("0101002499") ).body ) )
        //*/
        
        expect( tx.body.fee ).toBeGreaterThanOrEqual( 173983/*174611*/ );
        // console.log( JSON.stringify( tx.toJson(), undefined, 2) )

    });
})