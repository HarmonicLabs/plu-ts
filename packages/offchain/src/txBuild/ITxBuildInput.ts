import { UTxO, Script } from "@harmoniclabs/cardano-ledger-ts";
import { CanBeData, cloneCanBeData } from "../utils/CanBeData";


export interface ITxBuildInputRefScript {
    refUtxo: UTxO,
    datum: CanBeData | "inline",
    redeemer: CanBeData,
}

export interface ITxBuildInputInlineScript {
    script: Script,
    datum: CanBeData | "inline",
    redeemer: CanBeData
}

export interface ITxBuildInput {
    utxo: UTxO,
    referenceScriptV2?: ITxBuildInputRefScript
    inputScript?: ITxBuildInputInlineScript
}

export function cloneITxBuildInput({
    utxo,
    referenceScriptV2: ref,
    inputScript: inScript
}: ITxBuildInput ): ITxBuildInput
{
    const referenceScriptV2: ITxBuildInputRefScript | undefined = ref === undefined ? undefined :
    {
        refUtxo: ref.refUtxo.clone(),
        datum: ref.datum === "inline" ? "inline" : cloneCanBeData( ref.datum ),
        redeemer: cloneCanBeData( ref.redeemer )
    } as any

    const inputScript: ITxBuildInputInlineScript | undefined = inScript === undefined ? undefined :
    {
        script: inScript.script.clone(),
        datum: inScript.datum === "inline" ? "inline" : cloneCanBeData( inScript.datum ),
        redeemer: cloneCanBeData( inScript.redeemer )
    } as any;

    return {
        utxo: utxo.clone(),
        referenceScriptV2,
        inputScript
    }
}