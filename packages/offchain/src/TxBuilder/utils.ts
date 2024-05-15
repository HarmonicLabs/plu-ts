import { ScriptType } from "@harmoniclabs/cardano-ledger-ts";
import type { ToDataVersion } from "@harmoniclabs/cardano-ledger-ts/dist/toData/defaultToDataVersion";

export function scriptTypeToDataVersion( scriptType: ScriptType ): ToDataVersion | undefined
{
    // if( scriptType === ScriptType.NativeScript ) return undefined;
    if( scriptType === ScriptType.PlutusV1 ) return "v1";
    if( scriptType === ScriptType.PlutusV2 ) return "v2";
    if( scriptType === ScriptType.PlutusV3 ) return "v3";
    return undefined;
}