import CanBeData from "../../../CanBeData/CanBeData";
import Hash32 from "../../../hashes/Hash32/Hash32";
import Value from "../../../ledger/Value";
import Script from "../../../script/Script";
import TxOutRef from "../../body/output/TxOutRef";

export interface ITxBuildMint {
    value: Value
    script: {
        inline: Script
        redeemer: CanBeData
    } | {
        simpleRef: TxOutRef
        policyId: Hash32
    } | {
        ref: TxOutRef
        policyId: Hash32
        redeemer: CanBeData
    }
};

export default ITxBuildMint;