import CanBeData from "../../../CanBeData/CanBeData";
import Script from "../../../script/Script";
import TxOutRef from "../../body/output/TxOutRef";

export interface ITxBuildInput {
    utxo: TxOutRef,
    referenceScriptV2?: {
        refUtxo: TxOutRef,
        datum: CanBeData | "inline",
        redeemer: CanBeData,
    }
    inputScript?: {
        script: Script,
        datum: CanBeData | "inline",
        redeemer: CanBeData
    }
}

export default ITxBuildInput