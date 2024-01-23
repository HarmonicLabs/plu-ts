import { Address, PaymentCredentials, Script, TxBody, TxOutRef, TxRedeemer, UTxO, Value, defaultProtocolParameters } from "@harmoniclabs/cardano-ledger-ts";
import { UPLCEncoder, UPLCProgram, parseUPLC, parseUPLCText } from "@harmoniclabs/uplc"
import { ITxBuildInput, TxBuilder, defaultMainnetGenesisInfos } from "..";
import { DataConstr, dataToCbor } from "@harmoniclabs/plutus-data";
import { getSpendingPurposeData } from "../toOnChain/getSpendingPurposeData";


describe("tx with script", () => {

    const uplc = parseUPLCText("(lam a (lam b (lam c (con boolean True))))");

    const program = new UPLCProgram([1,0,0], uplc);

    const bytes = UPLCEncoder.compile( program ).toBuffer().buffer;

    const script = new Script(
        "PlutusScriptV2",
        bytes
    );

    const scriptAddr = Address.mainnet( PaymentCredentials.script( script.hash ) );

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

    const sndUtxo = new UTxO({
        utxoRef: {
            id: "cc".repeat(32),
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
                    inputScript: {
                        datum: "inline",
                        redeemer: new DataConstr(0,[]),
                        script
                    }
                },
                { utxo: otherUtxo }
            ],
            collaterals: [ otherUtxo ],
            changeAddress: Address.fake
        });

        expect( tx.witnesses.redeemers![0]?.index ).toEqual( 0 );

        expect( getSpendingPurposeData( tx.witnesses.redeemers![0], tx.body ) )
        .toEqual(
            new DataConstr(
                1, // Purpose.Spending
                [ tx.body.inputs[0].utxoRef.toData() ]
            )
        )

    });

    test("snd input", () => {

        const tx = txBuilder.buildSync({
            inputs: [
                { utxo: otherUtxo },
                {
                    utxo: fstUtxo,
                    inputScript: {
                        datum: "inline",
                        redeemer: new DataConstr(0,[]),
                        script
                    }
                },
            ],
            collaterals: [ otherUtxo ],
            changeAddress: Address.fake
        });

        expect( tx.witnesses.redeemers![0]?.index ).toEqual( 1 );

        expect( getSpendingPurposeData( tx.witnesses.redeemers![0], tx.body ) )
        .toEqual(
            new DataConstr(
                1, // Purpose.Spending
                [ tx.body.inputs[1].utxoRef.toData() ]
            )
        )
    });

    describe("two script in", () => {

        function findConstr0Rdmr( redeemers: TxRedeemer[] | undefined ): TxRedeemer | undefined
        {
            return redeemers?.find( rdmr => dataToCbor( rdmr.data ).toString() === dataToCbor( new DataConstr(0,[]) ).toString() );
        }

        function findConstr1Rdmr( redeemers: TxRedeemer[] | undefined ): TxRedeemer | undefined
        {
            return redeemers?.find( rdmr => dataToCbor( rdmr.data ).toString() === dataToCbor( new DataConstr(1,[]) ).toString() );
        }

        const fstIn: ITxBuildInput = {
            utxo: fstUtxo,
            inputScript: {
                datum: "inline",
                redeemer: new DataConstr(0,[]),
                script
            }
        };

        const sndIn: ITxBuildInput = {
            utxo: sndUtxo,
            inputScript: {
                datum: "inline",
                redeemer: new DataConstr(1,[]),
                script
            }
        };

        test("fst, snd", () => {
            const tx = txBuilder.buildSync({
                inputs: [
                    fstIn,
                    sndIn
                ],
                collaterals: [ otherUtxo ],
                changeAddress: Address.fake
            });
    
            expect( findConstr0Rdmr( tx.witnesses.redeemers )?.index ).toEqual( 0 );
            expect( findConstr1Rdmr( tx.witnesses.redeemers )?.index ).toEqual( 1 );

            expect( getSpendingPurposeData( tx.witnesses.redeemers![0], tx.body ) )
            .toEqual(
                new DataConstr(
                    1, // Purpose.Spending
                    [ tx.body.inputs[0].utxoRef.toData() ]
                )
            )
            expect( getSpendingPurposeData( tx.witnesses.redeemers![1], tx.body ) )
            .toEqual(
                new DataConstr(
                    1, // Purpose.Spending
                    [ tx.body.inputs[1].utxoRef.toData() ]
                )
            )
        });

        test("fst, other, snd", () => {
            const tx = txBuilder.buildSync({
                inputs: [
                    fstIn,
                    { utxo: otherUtxo },
                    sndIn
                ],
                collaterals: [ otherUtxo ],
                changeAddress: Address.fake
            });
    
            expect( findConstr0Rdmr( tx.witnesses.redeemers )?.index ).toEqual( 0 );
            expect( findConstr1Rdmr( tx.witnesses.redeemers )?.index ).toEqual( 2 );

            expect( getSpendingPurposeData( tx.witnesses.redeemers![0], tx.body ) )
            .toEqual(
                new DataConstr(
                    1, // Purpose.Spending
                    [ tx.body.inputs[0].utxoRef.toData() ]
                )
            )
            expect( getSpendingPurposeData( tx.witnesses.redeemers![1], tx.body ) )
            .toEqual(
                new DataConstr(
                    1, // Purpose.Spending
                    [ tx.body.inputs[2].utxoRef.toData() ]
                )
            )
        });

        test("snd, fst", () => {
            const tx = txBuilder.buildSync({
                inputs: [
                    sndIn,
                    fstIn,
                ],
                collaterals: [ otherUtxo ],
                changeAddress: Address.fake
            });
    
            expect( findConstr1Rdmr( tx.witnesses.redeemers )?.index ).toEqual( 0 );
            expect( findConstr0Rdmr( tx.witnesses.redeemers )?.index ).toEqual( 1 );

            expect( getSpendingPurposeData( tx.witnesses.redeemers![0], tx.body ) )
            .toEqual(
                new DataConstr(
                    1, // Purpose.Spending
                    [ tx.body.inputs[0].utxoRef.toData() ]
                )
            )
            expect( getSpendingPurposeData( tx.witnesses.redeemers![1], tx.body ) )
            .toEqual(
                new DataConstr(
                    1, // Purpose.Spending
                    [ tx.body.inputs[1].utxoRef.toData() ]
                )
            )
        });
    })
})