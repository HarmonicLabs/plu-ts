import { IUTxO, UTxO } from "@harmoniclabs/cardano-ledger-ts";
import { Data } from "@harmoniclabs/plutus-data";
import { CanBeData, forceData } from "../../utils/CanBeData";

export interface ITxBuildInputRefScript {
    refUtxo: IUTxO,
    datum: CanBeData | "inline",
    redeemer: CanBeData,
}

export interface NormalizedITxBuildInputRefScript extends ITxBuildInputRefScript {
    refUtxo: UTxO,
    datum: Data | "inline",
    redeemer: Data,
}

export function normalizeITxBuildInputRefScript( input: ITxBuildInputRefScript ): NormalizedITxBuildInputRefScript
{
    const result: NormalizedITxBuildInputRefScript = {} as any;
    
    result.refUtxo = new UTxO( input.refUtxo );
    result.datum = input.datum === "inline" ? "inline" : forceData( input.datum );
    result.redeemer = forceData( input.redeemer );

    return result;
}