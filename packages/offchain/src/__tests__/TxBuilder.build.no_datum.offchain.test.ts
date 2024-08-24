import { Address, Credential, Script, ScriptType, TxBody, TxOutRef, TxRedeemer, UTxO, Value, defaultProtocolParameters, nativeScriptToCbor } from "@harmoniclabs/cardano-ledger-ts";
import { UPLCDecoder, UPLCEncoder, UPLCProgram, parseUPLC, parseUPLCText } from "@harmoniclabs/uplc"
import { ITxBuildInput, TxBuilder, defaultMainnetGenesisInfos } from "..";
import { DataConstr, DataI, dataToCbor } from "@harmoniclabs/plutus-data";
import { getSpendingPurposeData } from "../toOnChain/getSpendingPurposeData";
import { fromHex, lexCompare } from "@harmoniclabs/uint8array-utils";


describe("tx with script", () => {

    const script = new Script(
        ScriptType.PlutusV3,
        fromHex("01010023259800800c5268b2ae6866e1cd55ce9baa329800991aba1357446ae88004c8d55cf1baa001002800c0060030019191aba13574400200300148888888c8cc966002600290004400e2b300130014800a20091598009800a400910058acc004c005200688034566002600290044401e2b300130014802a20111655cd1573455cd1573455cd15734370e6aae74004d55cf0009baa00713240041")
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
            datum: undefined
        }
    });

    const fstUtxoWDatum = new UTxO({
        utxoRef: {
            id: "bb".repeat(32),
            index: 2
        },
        resolved: {
            address: scriptAddr,
            value: Value.lovelaces( 5_000_000 ),
            datum: new DataI( 0 )
        }
    });


    const otherUtxo = new UTxO({
        utxoRef: { id: "aa".repeat(32),index:1 },
        resolved: {
            address: Address.fake,
            value: Value.lovelaces( 2_000_000 )
        }
    });

    test("no datum v3", () => {

        const tx = txBuilder.buildSync({
            inputs: [
                {
                    utxo: fstUtxo,
                    inputScript: {
                        script,
                        redeemer: new DataI( 0 )
                    }
                },
                { utxo: otherUtxo }
            ],
            changeAddress: Address.fake
        });

        expect( tx.witnesses.redeemers?.length ).toEqual( 1 );

    });

    test("with datum v3", () => {

        expect(() =>
            txBuilder.buildSync({
                inputs: [
                    {
                        utxo: fstUtxoWDatum,
                        inputScript: {
                            script,
                            redeemer: new DataI( 0 )
                        }
                    },
                    { utxo: otherUtxo }
                ],
                changeAddress: Address.fake
            })
        ).toThrow()
    });

    
    const scriptv2 = new Script(
        ScriptType.PlutusV2,
        UPLCEncoder.compile(
            new UPLCProgram(
                [1,0,0],
                parseUPLCText("(lam a (lam b (lam c (con unit))))")
            )
        ).toBuffer().buffer
    );

    const scriptv2Addr = Address.mainnet( Credential.script( scriptv2.hash ) );

    const fstUtxov2 = new UTxO({
        utxoRef: {
            id: "bb".repeat(32),
            index: 2
        },
        resolved: {
            address: scriptv2Addr,
            value: Value.lovelaces( 5_000_000 ),
            datum: undefined
        }
    });

    test("no datum v2", () => {

        expect(() => 
            txBuilder.buildSync({
                inputs: [
                    {
                        utxo: fstUtxov2,
                        inputScript: {
                            script: scriptv2,
                            redeemer: new DataI( 0 )
                        }
                    },
                    { utxo: otherUtxo }
                ],
                changeAddress: Address.fake
            })
        ).toThrow("datum was specified to be inline; but inline datum is missing");

    });
})
