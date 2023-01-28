import CanBeData from "../../../CanBeData/CanBeData";
import Script from "../../../script/Script";
import TxOutRef from "../../body/output/UTxO";
import type { AnyCertificate } from "../../../ledger/certs/Certificate";

export interface ITxBuildCert {
    cert: AnyCertificate
    script?: {
        inline: Script
        redeemer: CanBeData
    } | {
        ref: TxOutRef
        redeemer: CanBeData
    }
};

export default ITxBuildCert;