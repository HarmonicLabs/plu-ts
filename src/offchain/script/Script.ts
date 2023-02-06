import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import BufferUtils from "../../utils/BufferUtils";

import { Buffer } from "buffer";
import { blake2b_224, byte } from "../../crypto";
import { ScriptJsonFormat } from "../../onchain/pluts/Script";
import { NativeScript, nativeScriptFromCbor, nativeScriptToCbor } from "./NativeScript";
import { Cloneable } from "../../types/interfaces/Cloneable";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { Cbor } from "../../cbor/Cbor";
import { CborBytes } from "../../cbor/CborObj/CborBytes";
import { ToJson } from "../../utils/ts/ToJson";
import { CanBeCborString, CborString, forceCborString } from "../../cbor/CborString";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import { CborObj } from "../../cbor/CborObj";
import { CborArray } from "../../cbor/CborObj/CborArray";
import { BasePlutsError } from "../../errors/BasePlutsError";

export const enum ScriptType {
    NativeScript = "NativeScript",
    PlutusV1 = "PlutusScriptV1",
    PlutusV2 = "PlutusScriptV2"
}

function parseCborBytes( cbor: Buffer ): Buffer
{
    return ( Cbor.parse( cbor ) as CborBytes ).buffer
}

export class Script<T extends ScriptType = ScriptType>
    implements Cloneable<Script<T>>, ToJson, ToCbor
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

    toCbor(): CborString
    {
        return new CborString(
            BufferUtils.copy( this.cbor )
        );
    }
    toCborObj(): CborObj
    {
        return Cbor.parse( this.cbor );
    }

    static fromCbor( cbor: CanBeCborString ): Script
    static fromCbor<ScriptT extends ScriptType>( cbor: CanBeCborString, type: ScriptT ): Script<ScriptT>
    static fromCbor( cbor: CanBeCborString, type?: ScriptType ): Script
    {
        return Script.fromCborObj( Cbor.parse( forceCborString( cbor ) ), type as any );
    }

    static fromCborObj( cbor: CborObj ): Script
    static fromCborObj<ScriptT extends ScriptType>( cbor: CborObj, type: ScriptT ): Script<ScriptT>
    static fromCborObj( cObj: CborObj, type?: ScriptType ): Script
    {
        if( type !== undefined )
        {
            if( type === ScriptType.NativeScript )
            JsRuntime.assert(
                cObj instanceof CborArray,
                "invalid native script cbor"
            )
            else if( type === ScriptType.PlutusV1 || ScriptType.PlutusV2 )
            JsRuntime.assert(
                cObj instanceof CborBytes,
                "invalid plutus script cbor"
            )
            else throw new BasePlutsError(
                "invalid script type specified"
            );
        }
        else
        {
            if( cObj instanceof CborArray )
            type = ScriptType.NativeScript;
            else if( cObj instanceof CborBytes )
            type = ScriptType.PlutusV2;
            else throw new BasePlutsError(
                "invalid script type specified"
            );
        }

        return new Script( type, Cbor.encode( cObj ).asBytes );
    }
}