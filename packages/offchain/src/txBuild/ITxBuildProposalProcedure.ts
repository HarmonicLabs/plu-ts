import { Hash28, IProposalProcedure, ITypedVotingProceduresEntry, IVoter, IVotingProcedures, IVotingProceduresEntry, ProposalProcedure, VotingProcedures, canBeHash28, isVoterKind } from "@harmoniclabs/cardano-ledger-ts"
import { IScriptWithRedeemer, ScriptWithRedeemer } from "./ScriptWithRedeemer"
import { isObject } from "@harmoniclabs/obj-utils"
import { uint8ArrayEq } from "@harmoniclabs/uint8array-utils"

export interface ITxBuildProposalProcedure {
    proposalProcedure: IProposalProcedure
    script?: IScriptWithRedeemer
}

export interface NormalizedITxBuildProposalProcedure {
    proposalProcedure: ProposalProcedure
    script?: ScriptWithRedeemer
}
