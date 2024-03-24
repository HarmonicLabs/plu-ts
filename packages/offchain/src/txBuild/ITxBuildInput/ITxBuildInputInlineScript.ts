import { Script } from "@harmoniclabs/cardano-ledger-ts"
import { Data } from "@harmoniclabs/plutus-data"
import { CanBeData, forceData } from "../../utils/CanBeData";

export interface ITxBuildInputInlineScript {
    script: Script,
    datum: CanBeData | "inline",
    redeemer: CanBeData
}

export interface NormalizedITxBuildInputInlineScript {
    script: Script,
    datum: Data | "inline",
    redeemer: Data
}

export function normalizeITxBuildInputInlineScript( input: ITxBuildInputInlineScript ): NormalizedITxBuildInputInlineScript
{
    const result: NormalizedITxBuildInputInlineScript = {} as any;

    result.script = input.script.clone();
    result.datum = input.datum === "inline" ? "inline" : forceData( input.datum );
    result.redeemer = forceData( input.redeemer );

    return result;
}