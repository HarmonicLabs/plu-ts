import CanBeData from "../../../CanBeData/CanBeData";
import { TxWithdrawalsEntry } from "../../../ledger/TxWithdrawals";
import Script from "../../../script/Script";
import TxOutRef from "../../body/output/UTxO";

export interface ITxBuildWithdrawal {
    withdrawal: TxWithdrawalsEntry
    script?: {
        inline: Script
        redeemer: CanBeData
    } | {
        ref: TxOutRef
        redeemer: CanBeData
    }
};

export default ITxBuildWithdrawal;