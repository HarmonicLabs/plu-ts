import { Hash28, ITxOutRef, ITypedVotingProceduresEntry, IVoter, IVotingProcedure, IVotingProcedures, IVotingProceduresEntry, TxOutRef, Voter, VotingProcedure, VotingProcedures, canBeHash28, forceTxOutRef, isVoterKind } from "@harmoniclabs/cardano-ledger-ts"
import { IScriptWithRedeemer, ScriptWithRedeemer, normalizeIScriptWithRedeemer } from "./ScriptWithRedeemer"
import { isObject } from "@harmoniclabs/obj-utils"
import { uint8ArrayEq } from "@harmoniclabs/uint8array-utils"

export interface ITxBuildVotingProcedure {
    votingProcedure: IVotingProceduresEntry
    script?: IScriptWithRedeemer
}

export interface NormalizedITxBuildVotingProcedure {
    votingProcedure: ITypedVotingProceduresEntry
    script?: ScriptWithRedeemer
}

export function eqIVoter( a: IVoter, b: IVoter ): boolean
{
    if( !isObject( a ) ) return false;
    if( !isObject( b ) ) return false;

    return (
        isVoterKind( a.kind ) && a.kind === b.kind &&
        canBeHash28( a.hash ) &&
        canBeHash28( b.hash ) &&
        uint8ArrayEq(
            new Hash28( a.hash ).toBuffer(),
            new Hash28( b.hash ).toBuffer()
        )
    )
}

export function normalizeITxBuildVotingProcedure({ votingProcedure, script }: ITxBuildVotingProcedure): NormalizedITxBuildVotingProcedure
{
    return {
        votingProcedure: normalizeVotingProcedureEntry( votingProcedure ),
        script: script === undefined ? undefined : normalizeIScriptWithRedeemer( script )
    };
}

function normalizeVotesEntry({
    govActionId,
    vote
}:{
    govActionId: ITxOutRef;
    vote: IVotingProcedure;
}): {
    govActionId: TxOutRef;
    vote: VotingProcedure;
}
{
    return {
        govActionId: forceTxOutRef( govActionId ),
        vote: new VotingProcedure( vote )
    };
}

export function normalizeVotingProcedureEntry( votingProcedure: IVotingProceduresEntry ): ITypedVotingProceduresEntry
{
    return {
        voter: new Voter( votingProcedure.voter ),
        votes: votingProcedure.votes.map( normalizeVotesEntry )
    };
}