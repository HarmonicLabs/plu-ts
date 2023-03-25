import { CanBeData } from "../../../../types/Data/CanBeData";
import { Script } from "../../../script/Script";
import { UTxO } from "../../body/output/UTxO";

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
        datum: ref.datum === "inline" ? "inline" : ref.datum.clone(),
        redeemer: ref.redeemer.clone()
    } as any

    const inputScript: ITxBuildInputInlineScript | undefined = inScript === undefined ? undefined :
    {
        script: inScript.script.clone(),
        datum: inScript.datum === "inline" ? "inline" : inScript.datum.clone(),
        redeemer: inScript.redeemer.clone()
    } as any;

    return {
        utxo: utxo.clone(),
        referenceScriptV2,
        inputScript
    }
}