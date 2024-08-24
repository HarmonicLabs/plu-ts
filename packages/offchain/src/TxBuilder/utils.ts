import { getAllRequiredSigners, NativeScript, nativeScriptFromCbor, ScriptType, Tx, TxBody } from "@harmoniclabs/cardano-ledger-ts";
import type { ToDataVersion } from "@harmoniclabs/cardano-ledger-ts/dist/toData/defaultToDataVersion";

export function scriptTypeToDataVersion( scriptType: ScriptType ): ToDataVersion | undefined
{
    // if( scriptType === ScriptType.NativeScript ) return undefined;
    if( scriptType === ScriptType.PlutusV1 ) return "v1";
    if( scriptType === ScriptType.PlutusV2 ) return "v2";
    if( scriptType === ScriptType.PlutusV3 ) return "v3";
    return undefined;
}

export function estimateMaxSignersNeeded( tx: Tx ): number
{
    const bodySigners = getAllRequiredSigners( tx.body )
    .map( hash => hash.toString() )
    .filter( ( elem, i, thisArr ) => thisArr.indexOf( elem ) === i );

    const allSigners = getAllNativeScriptSigners(
        (tx.witnesses.nativeScripts ?? [])
        .map( script => script.toJson() as NativeScript ) 
    )
    .filter( native => native.type === "sig" )
    .map( native => (native as any).keyHash.toString() )
    .concat( bodySigners )
    .filter( ( elem, i, thisArr ) => thisArr.indexOf( elem ) === i );

    return allSigners.length <= 0 ? 1 : allSigners.length;
}


function getAllNativeScriptSigners( natives: NativeScript[] ): NativeScript[]
{
    return natives
    .reduce( (accum, native) => {
        
        if( native.type === "sig" ) accum.push( native );
        if(
            native.type === "all" ||
            native.type === "any" ||
            native.type === "atLeast"
        ) accum.push( ...getAllNativeScriptSigners( native.scripts ) );

        return accum;
    }, [] as NativeScript[]);
}