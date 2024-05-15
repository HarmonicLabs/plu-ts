import { getTxIntervalData } from "./getTxIntervalData";
import { GenesisInfos } from "../TxBuilder/GenesisInfos";
import { Data, DataB, DataConstr, DataList, DataMap, DataPair, hashData } from "@harmoniclabs/plutus-data";
import { Tx, TxRedeemer, UTxO, Value } from "@harmoniclabs/cardano-ledger-ts";
import { getSpendingPurposeData } from "./getSpendingPurposeData";
import { lexCompare } from "@harmoniclabs/uint8array-utils";
import type { ToDataVersion } from "@harmoniclabs/cardano-ledger-ts/dist/toData/defaultToDataVersion";

function sortUTxO( a: UTxO, b: UTxO ): number {
    const ord = lexCompare( a.utxoRef.id.toBuffer(), b.utxoRef.id.toBuffer() );
    // if equal tx id order based on tx output index
    if( ord === 0 ) return a.utxoRef.index - b.utxoRef.index;
    // else order by tx id
    return ord;
}

export function getTxInfos(
    transaction: Tx,
    genesisInfos: GenesisInfos | undefined
): { v1: Data | undefined, v2: Data | undefined, v3: Data }
{
    const {
        body: tx,
        witnesses
    } = transaction;

    function redeemerToDataPair( rdmr: TxRedeemer, version: ToDataVersion ): DataPair<DataConstr, Data>
    {
        return new DataPair(
            getSpendingPurposeData( rdmr, tx, version ),
            rdmr.data.clone()
        );
    }

    const sortedInputs = tx.inputs.slice().sort( sortUTxO );
    const sortedRefInputs = tx.refInputs?.slice().sort( sortUTxO );

    const feeData = Value.lovelaces( tx.fee ).toData();
    const mintData = (tx.mint ?? Value.lovelaces( 0 ) ).toData();
    const intervalData = getTxIntervalData( tx.validityIntervalStart, tx.ttl, genesisInfos );
    const sigsData = new DataList( tx.requiredSigners?.map( sig => sig.toData() ) ?? [] );
    const datumsData = new DataMap(
            witnesses.datums
            ?.map( dat => 
                new DataPair( 
                    new DataB(
                        hashData( dat )
                    ),
                    dat
                )
            ) ?? []
        );
    const txIdData = new DataB( tx.hash.toBuffer() );

    let v1: Data | undefined = undefined;

    try { // input and output to data might fail if only v2

        v1 = new DataConstr(
            0, // PTxInfo; only costructor
            [
                // inputs
                new DataList( sortedInputs.map( input => input.toData("v1") ) ),
                // outputs
                new DataList( tx.outputs.map( out => out.toData("v1") ) ),
                // fee
                feeData.clone(),
                // mint
                mintData.clone(),
                // dCertificates
                new DataList( tx.certs?.map( cert => cert.toData("v1") ) ?? [] ),
                // withderawals
                tx.withdrawals?.toData( "v1" ) ?? new DataMap([]),
                // interval
                intervalData.clone(),
                // signatories
                sigsData.clone(),
                // datums
                datumsData.clone(),
                // id
                txIdData.clone()
            ]
        );
        
    }
    catch { // input or output can't be v1 (inline datums etc...)
        v1 = undefined;
    }

    let v2: DataConstr | undefined = undefined;
    try {
        v2 = new DataConstr(
            0, // PTxInfo; only costructor
            [
                // inputs
                new DataList( sortedInputs.map( input => input.toData("v2") ) ),
                // refInputs
                new DataList( sortedRefInputs?.map( refIn => refIn.toData("v2") ) ?? [] ),
                // outputs
                new DataList( tx.outputs.map( out => out.toData("v2") ) ),
                // fee
                feeData,
                // mint
                mintData,
                // dCertificates
                new DataList( tx.certs?.map( cert => cert.toData("v2") ) ?? [] ),
                // withderawals
                tx.withdrawals?.toData( "v2" ) ?? new DataMap([]),
                // interval
                intervalData,
                // signatories
                sigsData,
                // redeemers
                new DataMap(
                    witnesses.redeemers?.map( rdmr => redeemerToDataPair( rdmr, "v2" ) ) ?? []
                ),
                // datums
                datumsData,
                // id
                txIdData
            ]
        );
    }
    catch
    {
        v2 = undefined;
    }

    const v3 = new DataConstr(
        0, // PTxInfo; only costructor
        [
            // inputs
            new DataList( sortedInputs.map( input => input.toData("v3") ) ),
            // refInputs
            new DataList( sortedRefInputs?.map( refIn => refIn.toData("v3") ) ?? [] ),
            // outputs
            new DataList( tx.outputs.map( out => out.toData("v3") ) ),
            // fee
            feeData,
            // mint
            mintData,
            // dCertificates
            new DataList( tx.certs?.map( cert => cert.toData("v3") ) ?? [] ),
            // withderawals
            tx.withdrawals?.toData( "v3" ) ?? new DataMap([]),
            // interval
            intervalData,
            // signatories
            sigsData,
            // redeemers
            new DataMap(
                witnesses.redeemers?.map( rdmr => redeemerToDataPair( rdmr, "v3" ) ) ?? []
            ),
            // datums
            datumsData,
            // id
            txIdData
        ]
    );

    return { v1, v2, v3 };
}