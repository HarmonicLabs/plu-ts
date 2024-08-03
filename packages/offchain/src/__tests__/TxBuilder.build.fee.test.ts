import { Address, Credential, Script, ScriptType, StakeCredentials, StakeKeyHash, TxBody, TxOutRef, TxRedeemer, UTxO, Value, defaultProtocolParameters, nativeScriptToCbor } from "@harmoniclabs/cardano-ledger-ts";
import { UPLCEncoder, UPLCProgram, parseUPLC, parseUPLCText } from "@harmoniclabs/uplc"
import { ITxBuildInput, TxBuilder, defaultMainnetGenesisInfos } from "..";
import { DataConstr, DataI, dataToCbor } from "@harmoniclabs/plutus-data";
import { getSpendingPurposeData } from "../toOnChain/getSpendingPurposeData";
import { fromHex, fromUtf8, lexCompare } from "@harmoniclabs/uint8array-utils";


describe("fee", () => {

    const script = new Script(
        ScriptType.PlutusV3,
        fromHex("0101002499")
    );

    const addr0 = Address.fromString("addr_test1qzq55vqf303tduqa0f6r4rmamt2lxw5c98yp5rcyekl6aupgrkxchwfa7uzxtc4sssn4hdp8pdhpe0gvnl3tec8yzjsq5enqa4");

    const txBuilder = new TxBuilder(
        defaultProtocolParameters,
        defaultMainnetGenesisInfos
    );

    const myUtxo = new UTxO({
        utxoRef: {
            id: "aada04b4f9bfc8ffbf55c8c3a654ef39b2ca51b20821b89acf3817c6058cf792",
            index: 5
        },
        resolved: {
            address: addr0 ,
            value: Value.lovelaces( 5_000_000 )
        }
    });

    test("fee", () => {

        let tx = txBuilder.buildSync({
            inputs: [
                { utxo: myUtxo }
            ],
            collaterals: [
                myUtxo
            ],
            mints: [
                {
                    script: {
                        inline: script,
                        redeemer: new DataI( 0 )
                    },
                    value: {
                        policy: script.hash,
                        assets: [
                            {
                                name: fromUtf8("plu-ts token name"),
                                quantity: 1
                            }
                        ]
                    }
                }
            ],
            changeAddress: addr0
        });

        expect( tx.body.fee ).toBeGreaterThanOrEqual( 174611 );
        console.log( JSON.stringify( tx.toJson(), undefined, 2) )

    });
})