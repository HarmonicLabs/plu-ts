import { Buffer } from "buffer";
import { ScriptJsonFormat } from "../../onchain/pluts/Script";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import NativeScript, { nativeScriptFromCbor, nativeScriptToCbor } from "./NativeScript";
import Cloneable from "../../types/interfaces/Cloneable";
import BufferUtils from "../../utils/BufferUtils";
import Hash28 from "../hashes/Hash28/Hash28";
import { blake2b_224, byte } from "../../crypto";
import Cbor from "../../cbor/Cbor";
import CborBytes from "../../cbor/CborObj/CborBytes";
import ToJson from "../../utils/ts/ToJson";
import CborString from "../../cbor/CborString";

export const enum ScriptType {
    NativeScript = "NativeScript",
    PlutusV1 = "PlutusScriptV1",
    PlutusV2 = "PlutusScriptV2"
}

function parseCborBytes( cbor: Buffer ): Buffer
{
    return ( Cbor.parse( cbor ) as CborBytes ).buffer
}

export default class Script<T extends ScriptType = ScriptType>
    implements Cloneable<Script<T>>, ToJson
{
    readonly type!: T;
    readonly cbor!: Buffer;
    readonly hash!: Hash28;

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

                    let scriptDataToHash = [] as number[];

                    if( this.type === ScriptType.NativeScript )
                        scriptDataToHash = [ 0x00 ].concat( Array.from( this.cbor ) );
                    else
                    {
                        const uplcBytes = Array.from(
                            parseCborBytes(
                                parseCborBytes(
                                    this.cbor
                                )
                            )
                        );

                        scriptDataToHash = [
                            this.type === ScriptType.PlutusV1 ? 0x01 : 0x02
                        ].concat( uplcBytes );
                    }

                    _hash = new Hash28(
                        Buffer.from(
                            blake2b_224( scriptDataToHash as byte[] )
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

    toJson()
    {
        if( this.type === ScriptType.NativeScript )
        {
            return nativeScriptFromCbor( new CborString( this.cbor ) )
        }
        else
        {
            return {
                type: this.type,
                description: "",
                cborHex: this.cbor.toString("hex")
            }
        }
    }
}