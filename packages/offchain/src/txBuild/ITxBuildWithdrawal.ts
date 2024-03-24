import { Hash28, ITxWithdrawalsEntry, ITxWithdrawalsEntryBigInt, IUTxO, Script, StakeAddress, UTxO, canBeHash28 } from "@harmoniclabs/cardano-ledger-ts"
import { CanBeData, forceData } from "../utils/CanBeData"
import { hasOwn } from "@harmoniclabs/obj-utils"
import { isData, cloneData, Data } from "@harmoniclabs/plutus-data"

export interface ITxBuildWithdrawal {
    withdrawal: ITxWithdrawalsEntry
    script?: {
        inline: Script
        redeemer: CanBeData
    } | {
        ref: IUTxO
        redeemer: CanBeData
    }
};

export interface NormalizedITxBuildWithdrawal extends ITxBuildWithdrawal {
    withdrawal: ITxWithdrawalsEntryBigInt | {
        rewardAccount: Hash28;
        amount: bigint;
    }
    script?: {
        inline: Script
        redeemer: Data
    } | {
        ref: UTxO
        redeemer: Data
    }
};

export function normalizeITxBuildWithdrawal({ withdrawal, script }: ITxBuildWithdrawal ): NormalizedITxBuildWithdrawal
{
    script = script === undefined ? undefined: hasOwn( script, "ref" ) ?
    {
        ref: script.ref.clone(),
        redeemer: isData( script.redeemer ) ? cloneData( script.redeemer ) : forceData( script.redeemer )
    } :
    {
        inline: script.inline.clone(),
        redeemer: isData( script.redeemer ) ? cloneData( script.redeemer ) : forceData( script.redeemer )
    };
    
    return {
        withdrawal: {
            rewardAccount: canBeHash28( withdrawal.rewardAccount ) ? new Hash28( withdrawal.rewardAccount ) : withdrawal.rewardAccount,
            amount: BigInt( withdrawal.amount )
        } as any,
        script: script as any
    };
}

/** @deprecated use `normalizeITxBuildWithdrawal` instead */
export function cloneITxBuildWithdrawal( stuff: ITxBuildWithdrawal ): ITxBuildWithdrawal
{
    return normalizeITxBuildWithdrawal( stuff );
}