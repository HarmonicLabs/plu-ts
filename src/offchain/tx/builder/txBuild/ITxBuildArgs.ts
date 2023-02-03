import type { CanBeUInteger } from "../../../../types/ints/Integer";
import type { PubKeyHash } from "../../../credentials/PubKeyHash";
import type { UTxO } from "../../body/output/UTxO";
import type { Address } from "../../../ledger/Address";
import type { ProtocolUpdateProposal } from "../../../ledger/protocol/ProtocolUpdateProposal";
import type { AddressStr } from "../../body/output/TxOut";
import type { TxMetadata } from "../../metadata/TxMetadata";
import type { ITxBuildCert } from "./ITxBuildCert";
import type { ITxBuildInput } from "./ITxBuildInput";
import type { ITxBuildMint } from "./ITxBuildMint";
import type { ITxBuildOutput } from "./ITxBuildOutput";
import type { ITxBuildWithdrawal } from "./ITxBuildWithdrawal";

export interface ITxBuildArgs {
    inputs: [ ITxBuildInput, ...ITxBuildInput[] ],
    changeAddress: Address | AddressStr,
    outputs?: ITxBuildOutput[],
    // era?: Era // latest
    readonlyRefInputs?: UTxO[],
    requiredSigners?: PubKeyHash[],
    collaterals?: UTxO[],
    collateralReturn?: ITxBuildOutput,
    mints?: ITxBuildMint[],
    invalidBefore?: CanBeUInteger,
    invalidAfter?: CanBeUInteger,
    certificates?: ITxBuildCert[],
    withdrawals?: ITxBuildWithdrawal[],
    metadata?: TxMetadata,
    protocolUpdateProposal?: ProtocolUpdateProposal
}