import { Address, Credential, defaultProtocolParameters, forceTxOutRef, Script, ScriptType, TxOutRef, UTxO, Value } from "@harmoniclabs/cardano-ledger-ts";
import { DataB } from "@harmoniclabs/plutus-data";
import { fromAscii, fromHex } from "@harmoniclabs/uint8array-utils";
import { defaultMainnetGenesisInfos, TxBuilder } from "../..";
import { defaultV3Costs } from "@harmoniclabs/cardano-costmodels-ts"

test("Hello plu-ts",() => {

    const script = new Script(
        ScriptType.PlutusV3,
        fromHex("01010032323232323232322323259800800c5268b2ae686644b3001002800c5282ae693001329800991aba1357446ae8800400a003001800c0064601800300148888888c8cc966002600290004400e2b300130014800a20091598009800a400910058acc004c005200688034566002600290044401e2b300130014802a20111655cd1573455cd1573455cd15734370e6aae74004d55cf0009baa007134928ca6002e3e664664600e46ae80c0080040052f588eb8dd6191aba1357446ae88d5d11aba2357446ae88d5d11aba2001300435742005375c6ae84005222330093003001002244464664b300130014800220071598009800a400510048b2ae68ab9a1b8735573a0026aae78004dd500184cdc79bae300a0014890c48656c6c6f20706c752d7473003002001235573c6ea800488cc01484008888cc014008c00c0048cc00c852811119802980200109801800912cc00400a2946002ab9a18011111194c004c0100066006003002401866008006004444b3001001801c4cc008d5d08009aba2001555cf88c8c0088cc0080080048c0088cc0080080048d5d09aba200101")
    );

    const scriptAddr = Address.mainnet(
        Credential.script( script.hash )
    );

    const myAddr = Address.fake;
    const myPkh = myAddr.paymentCreds.hash;

    const scriptInput = new UTxO({
        utxoRef: { id: "aa".repeat( 32 ), index: 0 },
        resolved: {
            address: scriptAddr,
            value: Value.lovelaces( 5_000_000 ),
            datum: new DataB( myPkh.toBuffer() )
        },
    });

    const myInput = new UTxO({
        utxoRef: { id: "bb".repeat( 32 ), index: 0 },
        resolved: {
            address: myAddr,
            value: Value.lovelaces( 5_000_000_000_000_000_000_000 ),
        }
    })

    // defaultProtocolParameters.costModels.PlutusScriptV3 = defaultV3Costs;

    const pps = {
        ...defaultProtocolParameters,
        costModels: {
            ...defaultProtocolParameters.costModels,
            PlutusScriptV3: defaultV3Costs
        }
    };

    const txBuilder = new TxBuilder( pps, defaultMainnetGenesisInfos );

    const tx = txBuilder.buildSync({
        inputs: [
            {
                utxo: scriptInput,
                inputScript: {
                    script: script,
                    datum: "inline",
                    redeemer: new DataB( fromAscii("Hello plu-ts") )
                }
            },
            { utxo: myInput }
        ],
        requiredSigners: [ myPkh ],
        changeAddress: myAddr
    });

})