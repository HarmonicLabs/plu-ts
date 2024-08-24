import { Value, Script, Hash32, UTxO, Hash28, IUTxO, IValuePolicyEntry, NormalizedIValuePolicyEntry, normalizeIValueAsset, isIUTxO, IValueAssetBI } from "@harmoniclabs/cardano-ledger-ts"
import { CanBeData, canBeData, forceData } from "../utils/CanBeData"
import { hasOwn, isObject } from "@harmoniclabs/obj-utils"
import { Data, cloneData, isData } from "@harmoniclabs/plutus-data"


export interface ITxBuildMint {
    value: IValuePolicyEntry | Value
    script: {
        inline: Script
        /** @deprecated, policy inferred from value */
        policyId?: Hash28
        redeemer: CanBeData
    } | {
        ref: IUTxO
        /** @deprecated, policy inferred from value */
        policyId?: Hash28
        redeemer: CanBeData
    }
};

export interface NormalizedITxBuildMint extends ITxBuildMint {
    value: NormalizedIValuePolicyEntry,
    script: {
        inline: Script
        redeemer: Data
    } | {
        ref: UTxO
        redeemer: Data
    }
}

export function normalizeITxBuildMint({ value, script }: ITxBuildMint ): NormalizedITxBuildMint
{
    if( value instanceof Value )
    {
        if( value.map.length !== 2 ) throw new Error("invalid mint value, only single policy allowed");
        value = value.map[1] as NormalizedIValuePolicyEntry;
    }

    if( !isNormalizedIValuePolicyEntry( value ) )
    {
        value = {
            policy: new Hash28( value.policy ),
            assets: value.assets.map( normalizeIValueAsset )
        } as NormalizedIValuePolicyEntry;
    }

    if(!isObject( script ) || !canBeData( script.redeemer ) ) throw new Error("invalid ITxBuildMint to normalize");

    if( isIUTxO( (script as any).ref ) )
    {
        script = {
            ref: new UTxO( (script as any).ref ),
            redeemer: forceData( script.redeemer )
        };
    } else {
        script = {
            inline: ((script as any).inline as Script).clone(),
            redeemer: forceData( script.redeemer )
        };
    }

    return {
        value,
        script
    } as NormalizedITxBuildMint;
}

function isNormalizedIValuePolicyEntry( stuff: any ): stuff is NormalizedIValuePolicyEntry
{
    return isObject( stuff ) && (
        stuff.policy instanceof Hash28 &&
        Array.isArray( stuff.assets ) &&
        stuff.assets.every( isIValueAssetBI )
    );
}

function isIValueAssetBI( stuff: any ): stuff is IValueAssetBI
{
    return isObject( stuff ) && (
        stuff.name instanceof Uint8Array &&
        typeof stuff.quantity === "bigint"
    );
}

/** @deprecated use `normalizeITxBuildMint` instead */
export function cloneITxBuildMint( mint: ITxBuildMint ): ITxBuildMint
{
    return normalizeITxBuildMint( mint );
}