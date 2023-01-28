import CanBeData from "../../../CanBeData/CanBeData";
import Hash32 from "../../../hashes/Hash32/Hash32";
import Value from "../../../ledger/Value/Value";
import Script from "../../../script/Script";
import TxOutRef from "../../body/output/UTxO";

export interface ITxBuildMint {
    value: Value
    script: {
        inline: Script
        policyId: Hash32
        redeemer: CanBeData
    } | {
        ref: TxOutRef
        policyId: Hash32
        redeemer: CanBeData
    }
};

export default ITxBuildMint;