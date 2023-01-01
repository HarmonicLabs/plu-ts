import BasePlutsError from "../../../../errors/BasePlutsError";
import { PMaybe, V1, pByteString, pInt } from "../../../../onchain";
import UPLCConst from "../../../../onchain/UPLC/UPLCTerms/UPLCConst";
import PDatumHash from "../../../../onchain/pluts/API/V1/ScriptsHashes/PDatumHash";
import PTxInInfo from "../../../../onchain/pluts/API/V1/Tx/PTxInInfo";
import PValue from "../../../../onchain/pluts/API/V1/Value/PValue";
import Term from "../../../../onchain/pluts/Term";
import { isData } from "../../../../types/Data";
import { maybeData } from "../../../../types/Data/toData/maybeData";
import TxOutRef from "../../body/output/TxOutRef";
import toPAddress from "./toPAddress";

export function toPTxInInfoV1( utxo: TxOutRef ): Term<typeof PTxInInfo>
{
    const valueData = utxo.resolved.amount.toData();
    const datumHash = utxo.resolved.datum;
    if( isData( datumHash ) )
    throw new BasePlutsError(
        "inline datum found on utxo to be transalted to 'PTxInInfo' V1!"
    );
    const datumHashData = maybeData( datumHash?.toData() )

    return V1.PTxInInfo.PTxInInfo({
        utxoRef: V1.PTxOutRef.PTxOutRef({
            id: V1.PTxId.PTxId({
                txId: pByteString( utxo.id.asBytes )
            }),
            index: pInt( utxo.index )
        }),
        resolved: V1.PTxOut.PTxOut({
            address: toPAddress( utxo.resolved.address ),
            datumHash: new Term(
                PMaybe( PDatumHash.type ).type,
                _dbn => UPLCConst.data( datumHashData )
            ),
            value: new Term(
                PValue.type,
                _dbn => UPLCConst.data( valueData )
            )
        })
    });
}