import type { CanBeUInteger } from "../../../../types/ints/Integer";
import type PubKeyHash from "../../../credentials/PubKeyHash";
import type Era from "../../../ledger/Era";
import { ProtocolParametersUpdate } from "../../../ledger/protocol/ProtocolUpdateProposal";
import type TxOutRef from "../../body/output/TxOutRef";
import { TxMetadata } from "../../metadata/TxMetadata";
import type ITxBuildCert from "./ITxBuildCert";
import type ITxBuildInput from "./ITxBuildInput";
import type ITxBuildMint from "./ITxBuildMint";
import type ITxBuildOutput from "./ITxBuildOutput";
import type ITxBuildWithdrawal from "./ITxBuildWithdrawal";

export interface ITxBuildArgs {
    inputs: [ ITxBuildInput, ...ITxBuildInput[] ],
    changeAddress: string,
    outputs?: ITxBuildOutput[],
    era?: Era
    readonlyRefInputs?: TxOutRef[],
    requiredSigners?: PubKeyHash[],
    collaterals?: TxOutRef[],
    returnCollaterals?: ITxBuildOutput[],
    mints?: ITxBuildMint[],
    invalidBefore?: CanBeUInteger,
    invalidAfter?: CanBeUInteger,
    certificates?: ITxBuildCert[],
    withdrawals?: ITxBuildWithdrawal[],
    metadata?: TxMetadata,
    protocolUpdateProposal?: ProtocolParametersUpdate
}

export default ITxBuildArgs;