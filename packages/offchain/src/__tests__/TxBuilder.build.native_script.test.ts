import { Address, Credential, Script, TxBody, TxOutRef, TxRedeemer, UTxO, Value, defaultProtocolParameters, nativeScriptToCbor } from "@harmoniclabs/cardano-ledger-ts";
import { UPLCEncoder, UPLCProgram, parseUPLC, parseUPLCText } from "@harmoniclabs/uplc"
import { ITxBuildInput, TxBuilder, defaultMainnetGenesisInfos } from "..";
import { DataConstr, dataToCbor } from "@harmoniclabs/plutus-data";
import { getSpendingPurposeData } from "../toOnChain/getSpendingPurposeData";
import { lexCompare } from "@harmoniclabs/uint8array-utils";


describe("tx with script", () => {

    const script = new Script(
        "NativeScript",
        nativeScriptToCbor({
            type: 'any',
            scripts: [
                {
                    type: 'sig',
                    keyHash: '814a30098be2b6f01d7a743a8f7ddad5f33a9829c81a0f04cdbfaef0'
                },
                {
                    type: 'sig',
                    keyHash: '6239b88172d8f3c7a7bb39c4f73891b5bf02da6737abf5fd26288e3b'
                }
            ]
        }).toBuffer()
    );

    const scriptAddr = Address.mainnet( Credential.script( script.hash ) );

    const txBuilder = new TxBuilder(
        defaultProtocolParameters,
        defaultMainnetGenesisInfos
    );

    const fstUtxo = new UTxO({
        utxoRef: {
            id: "bb".repeat(32),
            index: 2
        },
        resolved: {
            address: scriptAddr,
            value: Value.lovelaces( 5_000_000 ),
            datum: new DataConstr(0,[])
        }
    });

    const otherUtxo = new UTxO({
        utxoRef: { id: "aa".repeat(32),index:1 },
        resolved: {
            address: Address.fake,
            value: Value.lovelaces( 2_000_000 )
        }
    });

    test("fst input", () => {

        const tx = txBuilder.buildSync({
            inputs: [
                {
                    utxo: fstUtxo,
                    nativeScript: script
                },
                { utxo: otherUtxo }
            ],
            changeAddress: Address.fake
        });

        expect( tx.witnesses.redeemers ).toEqual( undefined );

    });
})