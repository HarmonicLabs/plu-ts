import type { CanBeUInteger } from "../../../../types/ints/Integer";
import type PubKeyHash from "../../../credentials/PubKeyHash";
import Address from "../../../ledger/Address";
import ProtocolUpdateProposal from "../../../ledger/protocol/ProtocolUpdateProposal";
import { AddressStr } from "../../body/output/TxOut";
import type TxOutRef from "../../body/output/UTxO";
import { TxMetadata } from "../../metadata/TxMetadata";
import type ITxBuildCert from "./ITxBuildCert";
import type ITxBuildInput from "./ITxBuildInput";
import type ITxBuildMint from "./ITxBuildMint";
import type ITxBuildOutput from "./ITxBuildOutput";
import type ITxBuildWithdrawal from "./ITxBuildWithdrawal";

export interface ITxBuildArgs {
    inputs: [ ITxBuildInput, ...ITxBuildInput[] ],
    changeAddress: Address | AddressStr,
    outputs?: ITxBuildOutput[],
    // era?: Era // latest
    readonlyRefInputs?: TxOutRef[],
    requiredSigners?: PubKeyHash[],
    collaterals?: TxOutRef[],
    collateralReturn?: ITxBuildOutput,
    mints?: ITxBuildMint[],
    invalidBefore?: CanBeUInteger,
    invalidAfter?: CanBeUInteger,
    certificates?: ITxBuildCert[],
    withdrawals?: ITxBuildWithdrawal[],
    metadata?: TxMetadata,
    protocolUpdateProposal?: ProtocolUpdateProposal
}

export default ITxBuildArgs;