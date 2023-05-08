import { TxWithdrawalsEntry, Script, UTxO } from "@harmoniclabs/cardano-ledger-ts"
import { CanBeData, forceData } from "../utils/CanBeData"
import { hasOwn } from "@harmoniclabs/obj-utils"
import { isData, cloneData } from "@harmoniclabs/plutus-data"


export interface ITxBuildWithdrawal {
    withdrawal: TxWithdrawalsEntry
    script?: {
        inline: Script
        redeemer: CanBeData
    } | {
        ref: UTxO
        redeemer: CanBeData
    }
};

export function cloneITxBuildWithdrawal( stuff: ITxBuildWithdrawal ): ITxBuildWithdrawal
{
    const script = stuff.script === undefined ? undefined: hasOwn( stuff.script, "inline" ) ?
    {
        inline: stuff.script.inline.clone(),
        redeemer: isData( stuff.script.redeemer ) ? cloneData( stuff.script.redeemer ) : forceData( stuff.script.redeemer )
    } :
    {
        ref: stuff.script.ref.clone(),
        redeemer: isData( stuff.script.redeemer ) ? cloneData( stuff.script.redeemer ) : forceData( stuff.script.redeemer )
    };
    
    return {
        withdrawal: {
            rewardAccount: stuff.withdrawal.rewardAccount.clone(),
            amount: stuff.withdrawal.amount
        },
        script
    };
}