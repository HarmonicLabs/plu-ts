import { UTxO, Script, IUTxO } from "@harmoniclabs/cardano-ledger-ts";
import { CanBeData, cloneCanBeData } from "../../utils/CanBeData";
import { Data } from "@harmoniclabs/plutus-data";
import { ITxBuildInputRefScript, NormalizedITxBuildInputRefScript, normalizeITxBuildInputRefScript } from "./ITxBuildInputRefScript";
import { ITxBuildInputInlineScript, NormalizedITxBuildInputInlineScript, normalizeITxBuildInputInlineScript } from "./ITxBuildInputInlineScript";


export interface ITxBuildInput {
    utxo: IUTxO,
    referenceScriptV2?: ITxBuildInputRefScript
    inputScript?: ITxBuildInputInlineScript
}

export interface NormalizedITxBuildInput extends ITxBuildInput {
    utxo: UTxO,
    referenceScriptV2?: NormalizedITxBuildInputRefScript
    inputScript?: NormalizedITxBuildInputInlineScript
}

export function normalizeITxBuildInput( input: ITxBuildInput ): NormalizedITxBuildInput
{
    const result: NormalizedITxBuildInput = {} as any;

    result.utxo = input.utxo instanceof UTxO ? input.utxo.clone() : new UTxO( input.utxo );
    result.referenceScriptV2 = input.referenceScriptV2 ?
        normalizeITxBuildInputRefScript( input.referenceScriptV2 ) :
        undefined;
    result.inputScript = input.inputScript ? 
        normalizeITxBuildInputInlineScript( input.inputScript ) :
        undefined;

    return result;
}

/**
 * @deprecated
 * use `normalizeITxBuildInput` instead
 */
export function cloneITxBuildInput({
    utxo,
    referenceScriptV2: ref,
    inputScript: inScript
}: ITxBuildInput ): ITxBuildInput
{
    const referenceScriptV2: ITxBuildInputRefScript | undefined = ref === undefined ? undefined :
    {
        refUtxo: new UTxO( ref.refUtxo ),
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
        utxo: new UTxO( utxo ),
        referenceScriptV2,
        inputScript
    }
}