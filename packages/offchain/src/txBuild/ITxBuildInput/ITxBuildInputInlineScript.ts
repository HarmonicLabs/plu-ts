import { Script } from "@harmoniclabs/cardano-ledger-ts"
import { Data } from "@harmoniclabs/plutus-data"
import { canBeData, CanBeData, forceData } from "../../utils/CanBeData";

export interface ITxBuildInputInlineScript {
    script: Script,
    datum?: CanBeData | "inline" | undefined,
    redeemer: CanBeData
}

export interface NormalizedITxBuildInputInlineScript {
    script: Script,
    datum: Data | "inline" | undefined,
    redeemer: Data
}

export function normalizeITxBuildInputInlineScript( input: ITxBuildInputInlineScript ): NormalizedITxBuildInputInlineScript
{
    const result: NormalizedITxBuildInputInlineScript = {} as any;

    result.script = input.script.clone();
    result.datum = (
        input.datum === "inline" ? "inline" :
        (
            canBeData( input.datum ) ? forceData( input.datum ) :
            undefined
        )
    );
    result.redeemer = forceData( input.redeemer );

    return result;
}