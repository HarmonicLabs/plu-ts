import { IUTxO, Script, UTxO, isIUTxO } from "@harmoniclabs/cardano-ledger-ts";
import { Data } from "@harmoniclabs/plutus-data";
import { CanBeData, forceData } from "../utils/CanBeData";

export type ScriptWithRedeemer = {
    inline: Script
    redeemer: Data
} | {
    ref: UTxO
    redeemer: Data
};

export type IScriptWithRedeemer = {
    inline: Script
    redeemer: CanBeData
} | {
    ref: IUTxO
    redeemer: CanBeData
};

export function normalizeIScriptWithRedeemer( script: IScriptWithRedeemer ): ScriptWithRedeemer
{
    const redeemer = forceData( script.redeemer );
    return isIUTxO( (script as any).ref ) ? {
        ref: new UTxO( (script as any).ref ),
        redeemer
    } : {
        inline: ((script as any).inline as Script).clone(),
        redeemer
    };
}