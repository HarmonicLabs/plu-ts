import { Address, Script, PaymentCredentials, Hash32, UTxO, Value, defaultProtocolParameters, isIUTxO } from "@harmoniclabs/cardano-ledger-ts";
import { ITxRunnerProvider } from "../../IProvider";
import { TxBuilder } from "../../TxBuilder";
import { DataConstr, DataI } from "@harmoniclabs/plutus-data";
import { compile, pfn, data, unit, pmakeUnit } from "@harmoniclabs/plu-ts-onchain";

const SYS_START = 1506203091000; // Date.parse("2017-09-23T21:44:51Z"); // mainnet start

const fakeProvider: ITxRunnerProvider = {
    async getGenesisInfos()
    {
        return {
            slotLengthInMilliseconds: 1000,
            systemStartPOSIX: SYS_START
        }
    },
    async resolveUtxos(utxos)
    {
        return utxos.map( u => {

            if( u instanceof UTxO ) return u;
            if( isIUTxO( u ) ) return new UTxO( u );

            if( typeof u === "string" )
            {
                const [ id, idx ] = u.split("#");
                u = {
                    id: id,
                    index: parseInt( idx )
                };
            }

            return new UTxO({
                utxoRef: u,
                resolved: {
                    address: Address.fake,
                    value: Value.lovelaces( 10_000_000 )
                }
            });
        })
    },
    async resolveDatumHashes( hashes: Hash32[] ) { return [ { hash: "00".repeat(32), datum: new DataConstr( 0, [] )} ] },
    async getChangeAddress() {
        return new Address(
            "testnet",
            PaymentCredentials.pubKey( "aa".repeat(28) )
        ).toString() as any
    }
}

const txBuilder = new TxBuilder( defaultProtocolParameters );

const txRunner = txBuilder.runWithProvider( fakeProvider );

describe("TxBuilderRunner", () => {

    test("simple", async () => {

        const tx = await txRunner
        .addInputs([
            new UTxO({
                utxoRef: {
                    id: "00".repeat( 32 ),
                    index: 0
                },
                resolved: {
                    address: Address.fake,
                    value: Value.lovelaces( 10_000_000 )
                }
            })
        ])
        .payTo( Address.fake, 5_000_000 )
        .build();

    });

    test("simple but unresolved", async () => {

        const tx = await txRunner
        .addInputs([ `${"00".repeat( 32 )}#0` ])
        .payTo( Address.fake, 5_000_000 )
        .build();
        
    });

    test("script", async () => {

        const okScript = new Script(
            "PlutusScriptV2",
            compile(
                pfn([ data, data, data ], unit )
                (( d, r, c ) => pmakeUnit())
            )
        );

        const okAddress = new Address(
            "testnet",
            PaymentCredentials.script( okScript.hash )
        );

        const tx = await txRunner
        .addInput(
            new UTxO({
                utxoRef: {
                    id: "ff".repeat( 32 ),
                    index: 0
                },
                resolved: {
                    address: okAddress,
                    value: Value.lovelaces( 10_000_000 ),
                    datum: new DataI( 0 )
                }
            }),
            new DataI( 0 )
        )
        .attachValidator( okScript )
        .payTo( Address.fake, 5_000_000 )
        .build();
        
    })
})