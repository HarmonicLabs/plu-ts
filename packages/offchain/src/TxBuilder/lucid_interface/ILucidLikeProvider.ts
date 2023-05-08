import { LucidProtocolParameters } from "./LucidProtocolParameters";
import { LucidAddress, LucidCredential, LucidDatum, LucidDatumHash, LucidDelegation, LucidOutRef, LucidRewardAddress, LucidTransaction, LucidTxHash, LucidUTxO, LucidUnit } from "./LucidTypes";

export interface ILucidLikeProvider {
    getProtocolParameters(): Promise<LucidProtocolParameters>
    getUtxos(
        addr_or_credentials: LucidAddress | LucidCredential
    ): Promise<LucidUTxO[]>
    getUtxosWithUnit(
        addr_or_credentials: LucidAddress | LucidCredential,
        unit: LucidUnit
    ): Promise<LucidUTxO[]>
    getUtxosByUnit(
        unit: LucidUnit
    ): Promise<LucidUTxO[]>
    getUtxosByOutRef( outRefs: LucidOutRef[] ): Promise<LucidUTxO[]>
    getDelegation( rewardAddress: LucidRewardAddress ): Promise<LucidDelegation>
    getDatum( datumHash: LucidDatumHash ): Promise<LucidDatum>
    awaitTx( txHash: LucidTxHash, checkInterval?: number ): Promise<boolean>
    submitTx( tx: LucidTransaction ): Promise<LucidTxHash>
}