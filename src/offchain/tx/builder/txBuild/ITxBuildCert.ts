import type { Script } from "../../../script/Script";
import type { UTxO } from "../../body/output/UTxO";
import type { AnyCertificate } from "../../../ledger/certs/Certificate";
import type { CanBeData } from "../../../../types/Data/CanBeData";

export interface ITxBuildCert {
    cert: AnyCertificate
    script?: {
        inline: Script
        redeemer: CanBeData
    } | {
        ref: UTxO
        redeemer: CanBeData
    }
};