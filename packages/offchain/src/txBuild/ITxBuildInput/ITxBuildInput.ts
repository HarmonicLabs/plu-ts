import { UTxO, Script, IUTxO, NativeScript, ScriptType, nativeScriptFromCbor, nativeScriptToCbor } from "@harmoniclabs/cardano-ledger-ts";
import { CanBeData, cloneCanBeData } from "../../utils/CanBeData";
import { Data } from "@harmoniclabs/plutus-data";
import { ITxBuildInputRefScript, NormalizedITxBuildInputRefScript, normalizeITxBuildInputRefScript } from "./ITxBuildInputRefScript";
import { ITxBuildInputInlineScript, NormalizedITxBuildInputInlineScript, normalizeITxBuildInputInlineScript } from "./ITxBuildInputInlineScript";


export interface ITxBuildInput {
    utxo: IUTxO,
    /** @deprecated use `referenceScript` instead */
    referenceScriptV2?: ITxBuildInputRefScript
    referenceScript?: ITxBuildInputRefScript
    inputScript?: ITxBuildInputInlineScript,
    nativeScript?: NativeScript | Script
}

export interface NormalizedITxBuildInput extends ITxBuildInput {
    utxo: UTxO,
    referenceScript?: NormalizedITxBuildInputRefScript
    inputScript?: NormalizedITxBuildInputInlineScript
    nativeScript?: Script<"NativeScript"|ScriptType.NativeScript>
}

export function normalizeITxBuildInput( input: ITxBuildInput ): NormalizedITxBuildInput
{
    input = { ...input }; // do not modify input object.
    const result: NormalizedITxBuildInput = {} as any;

    if( !input.referenceScript && input.referenceScriptV2 )
    input.referenceScript = input.referenceScriptV2; // support deprecated name, but do not override

    result.utxo = input.utxo instanceof UTxO ? input.utxo.clone() : new UTxO( input.utxo );
    result.referenceScript = input.referenceScript ?
        normalizeITxBuildInputRefScript( input.referenceScript ) :
        undefined;
    result.inputScript = input.inputScript ? 
        normalizeITxBuildInputInlineScript( input.inputScript ) :
        undefined;
    result.nativeScript = normalizeNativeScriptEntry( input.nativeScript );

    return result;
}

function isNativeScript( stuff: any ): stuff is NativeScript
{
    try {
        nativeScriptFromCbor( nativeScriptToCbor( stuff ) );
        return true;
    } catch { return false; }
}

function normalizeNativeScriptEntry( scr: NativeScript | Script | undefined ): Script<"NativeScript"> | undefined
{
    if( !scr ) return undefined;
    if( isNativeScript( scr ) )
    {
        return new Script(
            "NativeScript",
            nativeScriptToCbor( scr ).toBuffer()
        );
    }
    if( scr instanceof Script && scr.type === ScriptType.NativeScript )
    return scr.clone() as Script<"NativeScript">;

    return undefined;
}

/**
 * @deprecated
 * use `normalizeITxBuildInput` instead
 */
export function cloneITxBuildInput({
    utxo,
    referenceScript: ref,
    inputScript: inScript,
    nativeScript
}: ITxBuildInput ): ITxBuildInput
{
    const referenceScript: ITxBuildInputRefScript | undefined = ref === undefined ? undefined :
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
        referenceScript,
        inputScript,
        nativeScript: normalizeNativeScriptEntry( nativeScript )
    }
}