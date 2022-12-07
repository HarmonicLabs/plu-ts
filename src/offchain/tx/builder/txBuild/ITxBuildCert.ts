import CanBeData from "../../../CanBeData/CanBeData";
import Script from "../../../script/Script";
import TxOutRef from "../../body/output/TxOutRef";

export interface ITxBuildCert {
    cert: any
    script: {
        inline: Script
        redeemer: CanBeData
    } | {
        ref: TxOutRef
        redeemer: CanBeData
    }
};

export default ITxBuildCert;