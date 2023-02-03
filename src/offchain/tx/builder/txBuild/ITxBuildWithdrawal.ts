import { CanBeData } from "../../../../types/Data/CanBeData";
import { TxWithdrawalsEntry } from "../../../ledger/TxWithdrawals";
import { Script } from "../../../script/Script";
import { UTxO } from "../../body/output/UTxO";

export interface ITxBuildWithdrawal {
    withdrawal: TxWithdrawalsEntry
    script?: {
        inline: Script
        redeemer: CanBeData
    } | {
        ref: UTxO
        redeemer: CanBeData
    }
};