import { PData, PStruct, Term } from "../../../../onchain";
import Data from "../../../../types/Data";
import Script from "../../../script/Script";
import TxOutRef from "../../body/output/TxOutRef";

export interface ITxBuildInput {
    utxo: TxOutRef,
    referenceScriptV2?: {
        refUtxo: TxOutRef,
        datum: Data | Term<PData> | Term<PStruct<any>> | "inline",
        redeemer: Data | Term<PData> | Term<PStruct<any>>
    }
    referenceNativeScript?: TxOutRef
    inputScript?: {
        script: Script,
        datum: Data | Term<PData> | Term<PStruct<any>> | "inline",
        redeemer: Data | Term<PData> | Term<PStruct<any>>
    }
}

export default ITxBuildInput