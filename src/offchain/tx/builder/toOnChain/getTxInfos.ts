import { getTxIntervalData } from "./getTxIntervalData";
import { Data } from "../../../../types/Data";
import { DataConstr } from "../../../../types/Data/DataConstr";
import { DataList } from "../../../../types/Data/DataList";
import { DataMap } from "../../../../types/Data/DataMap";
import { DataPair } from "../../../../types/Data/DataPair";
import { Value } from "../../../ledger/Value/Value";
import { Tx } from "../../Tx";
import { hashData } from "../../../../types/Data/hashData";
import { DataB } from "../../../../types/Data/DataB";
import { TxRedeemer } from "../../TxWitnessSet/TxRedeemer";

export function getTxInfos( transaction: Tx ): { v1: Data | undefined, v2: Data }
{
    const {
        body: tx,
        witnesses
    } = transaction;

    function redeemerToDataPair( rdmr: TxRedeemer ): DataPair<DataConstr, Data>
    {
        return new DataPair(
            rdmr.toSpendingPurposeData( tx ),
            rdmr.data.clone()
        )
    }

    const feeData = Value.lovelaces( tx.fee ).toData();
    const mintData = (tx.mint ?? Value.lovelaces( 0 ) ).toData();
    const certsData = new DataList( tx.certs?.map( cert => cert.toData() ) ?? [] );
    const withdrawsData = tx.withdrawals?.toData() ?? new DataMap([]);
    const intervalData = getTxIntervalData( tx.validityIntervalStart, tx.ttl );
    const sigsData = new DataList( tx.requiredSigners?.map( sig => sig.toData() ) ?? [] );
    const datumsData = new DataMap(
            witnesses.datums
            ?.map( dat => 
                new DataPair( 
                    new DataB(
                        Buffer.from(
                            hashData( dat )
                        )
                    ),
                    dat
                )
            ) ?? []
        );
    const txIdData = new DataB( tx.hash.asBytes );

    let v1: Data | undefined = undefined;

    try { // input and output to data might fail if only v2

        v1 = new DataConstr(
            0, // PTxInfo; only costructor
            [
                // inputs
                new DataList( tx.inputs.map( input => input.toData("v1") ) ),
                // outputs
                new DataList( tx.outputs.map( out => out.toData("v1") ) ),
                // fee
                feeData.clone(),
                // mint
                mintData.clone(),
                // dCertificates
                certsData.clone(),
                // withderawals
                withdrawsData.clone(),
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

    const v2 = new DataConstr(
        0, // PTxInfo; only costructor
        [
            // inputs
            new DataList( tx.inputs.map( input => input.toData("v2") ) ),
            // refInouts
            new DataList( tx.refInputs?.map( refIn => refIn.toData("v2") ) ?? [] ),
            // outputs
            new DataList( tx.outputs.map( out => out.toData("v2") ) ),
            // fee
            feeData,
            // mint
            mintData,
            // dCertificates
            certsData,
            // withderawals
            withdrawsData,
            // interval
            intervalData,
            // signatories
            sigsData,
            // redeemers
            new DataMap(
                witnesses.redeemers?.map( redeemerToDataPair ) ?? []
            ),
            // datums
            datumsData,
            // id
            txIdData
        ]
    );

    return { v1, v2 };
}