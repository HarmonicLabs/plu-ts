import { IUTxO, Script, UTxO } from "@harmoniclabs/cardano-ledger-ts";
import { Data } from "@harmoniclabs/plutus-data";
import { CanBeData } from "../utils/CanBeData";

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