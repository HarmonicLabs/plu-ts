import { Value, Script, Hash32, UTxO, Hash28 } from "@harmoniclabs/cardano-ledger-ts"
import { CanBeData, forceData } from "../utils/CanBeData"
import { hasOwn } from "@harmoniclabs/obj-utils"
import { cloneData, isData } from "@harmoniclabs/plutus-data"


export interface ITxBuildMint {
    value: Value
    script: {
        inline: Script
        policyId: Hash28
        redeemer: CanBeData
    } | {
        ref: UTxO
        policyId: Hash28
        redeemer: CanBeData
    }
};

export function cloneITxBuildMint( mint: ITxBuildMint ): ITxBuildMint
{
    const script = hasOwn( mint.script, "inline" ) ?
    {
        inline: mint.script.inline.clone(),
        policyId: mint.script.policyId.clone(),
        redeemer: isData( mint.script.redeemer ) ? cloneData( mint.script.redeemer ) : forceData( mint.script.redeemer )
    } :
    {
        ref: mint.script.ref.clone(),
        policyId: mint.script.policyId.clone(),
        redeemer: isData( mint.script.redeemer ) ? cloneData( mint.script.redeemer ) : forceData( mint.script.redeemer )
    };
    
    return {
        value: mint.value.clone(),
        script
    };
}