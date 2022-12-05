import { Buffer } from "buffer";
import { ScriptJsonFormat } from "../../onchain/pluts/Script";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import NativeScript, { nativeScriptToCbor } from "./NativeScript";

export const enum ScriptType {
    NativeScript = "NativeScript",
    PlutusV1 = "PlutusScriptV1",
    PlutusV2 = "PlutusScriptV2"
}

export default class Script<T extends ScriptType = ScriptType>
{
    readonly type!: T;
    readonly cbor!: Buffer;

    constructor( scriptType: T, cbor: Buffer | (T extends ScriptType.NativeScript ? NativeScript : ScriptJsonFormat) )
    {
        JsRuntime.assert(
            scriptType === ScriptType.NativeScript  ||
            scriptType === ScriptType.PlutusV1      ||
            scriptType === ScriptType.PlutusV2,
            "invalid 'scriptType'"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "type",
            scriptType
        );

        if( !Buffer.isBuffer(cbor) )
        {
            if(
                (cbor.type as any) === ScriptType.PlutusV1 ||
                (cbor.type as any) === ScriptType.PlutusV2
            )
            {
                cbor = Buffer.from( (cbor as ScriptJsonFormat).cborHex, "hex" )
            }
            else
            {
                cbor = nativeScriptToCbor( cbor as NativeScript ).asBytes
            }
        }
        ObjectUtils.defineReadOnlyProperty(
            this,
            "cbor",
            cbor
        );
    }
}