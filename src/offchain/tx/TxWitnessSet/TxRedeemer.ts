import Data from "../../../types/Data"
import ExecUnits from "../../ledger/ExecUnits"

export const enum TxRedeemerTag {
    Spend    = 0,
    Mint     = 1,
    Cert     = 2,
    Withdraw = 3
};

export default class TxRedeemer
{
    readonly tag: TxRedeemerTag
    /**
     * index of the input the redeemer corresponds to
    **/
    readonly index: number
    readonly data: Data
    readonly execUnits: ExecUnits
}