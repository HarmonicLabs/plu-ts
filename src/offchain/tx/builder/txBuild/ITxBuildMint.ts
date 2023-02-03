import type { CanBeData } from "../../../../types/Data/CanBeData";
import type { Hash32 } from "../../../hashes/Hash32/Hash32";
import type { Value } from "../../../ledger/Value/Value";
import type { Script } from "../../../script/Script";
import type { UTxO } from "../../body/output/UTxO";

export interface ITxBuildMint {
    value: Value
    script: {
        inline: Script
        policyId: Hash32
        redeemer: CanBeData
    } | {
        ref: UTxO
        policyId: Hash32
        redeemer: CanBeData
    }
};