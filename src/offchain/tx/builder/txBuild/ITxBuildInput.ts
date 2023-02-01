import { CanBeData } from "../../../../types/Data/CanBeData";
import Script from "../../../script/Script";
import UTxO, { IUTxO }from "../../body/output/UTxO";

export interface ITxBuildInput {
    utxo: UTxO,
    referenceScriptV2?: {
        refUtxo: UTxO,
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