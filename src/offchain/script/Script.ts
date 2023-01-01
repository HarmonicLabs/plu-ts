import { Buffer } from "buffer";
import { ScriptJsonFormat } from "../../onchain/pluts/Script";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import NativeScript, { nativeScriptToCbor } from "./NativeScript";
import Cloneable from "../../types/interfaces/Cloneable";
import BufferUtils from "../../utils/BufferUtils";
import Hash28 from "../hashes/Hash28/Hash28";
import { blake2b_224 } from "../../crypto";

export const enum ScriptType {
    NativeScript = "NativeScript",
    PlutusV1 = "PlutusScriptV1",
    PlutusV2 = "PlutusScriptV2"
}

export default class Script<T extends ScriptType = ScriptType>
    implements Cloneable<Script<T>>
{
    readonly type!: T;
    readonly cbor!: Buffer;
    readonly hash: Hash28;

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

        let _hash: Hash28 = undefined as any;

        ObjectUtils.definePropertyIfNotPresent(
            this, "hash",
            {
                get: () => {
                    if( _hash instanceof Hash28 ) return _hash.clone();

                    _hash = new Hash28(
                        Buffer.from(
                            blake2b_224(
                                this.cbor
                            )
                        )
                    );

                    return _hash.clone();
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        )
    }

    clone(): Script<T>
    {
        return new Script(
            this.type,
            BufferUtils.copy( this.cbor )
        );
    }
}