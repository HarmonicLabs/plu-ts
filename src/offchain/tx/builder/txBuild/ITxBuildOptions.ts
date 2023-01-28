import ExBudget from "../../../../onchain/CEK/Machine/ExBudget";
import { PureUPLCTerm } from "../../../../onchain/UPLC/UPLCTerm";
import TxRedeemer from "../../TxWitnessSet/TxRedeemer";

export interface ITxBuildOptions {
    onScriptInvalid?: ( rdmr: TxRedeemer, logs: string[] ) => void
    onScriptResult?:  ( rdmr: TxRedeemer, result: PureUPLCTerm, exBudget: ExBudget, logs: string[] ) => void
}

export default ITxBuildOptions;