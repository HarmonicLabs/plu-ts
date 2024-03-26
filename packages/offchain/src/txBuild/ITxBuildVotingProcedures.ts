import { Hash28, ITypedVotingProceduresEntry, IVoter, IVotingProcedures, IVotingProceduresEntry, VotingProcedures, canBeHash28, isVoterKind } from "@harmoniclabs/cardano-ledger-ts"
import { IScriptWithRedeemer, ScriptWithRedeemer } from "./ScriptWithRedeemer"
import { isObject } from "@harmoniclabs/obj-utils"
import { uint8ArrayEq } from "@harmoniclabs/uint8array-utils"

export interface ITxBuildVotingProcedures {
    votingProcedure: IVotingProceduresEntry
    script?: IScriptWithRedeemer
}

export interface NormalizedITxBuildVotingProcedures {
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