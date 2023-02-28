import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import BufferUtils from "../../utils/BufferUtils";

import { Buffer } from "buffer";
import { blake2b_224, byte } from "../../crypto";
import { PlutusScriptVersion, ScriptJsonFormat } from "../../onchain/pluts/Script";
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
import { CborTag } from "../../cbor/CborObj/CborTag";
import { CborUInt } from "../../cbor/CborObj/CborUInt";
import { InvalidCborFormatError } from "../../errors/InvalidCborFormatError";

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
    readonly bytes!: Buffer;
    readonly hash!: Hash28;

    constructor( scriptType: T, bytes: Buffer | (T extends ScriptType.NativeScript ? NativeScript : ScriptJsonFormat) )
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

        if( !Buffer.isBuffer(bytes) )
        {
            if(
                (bytes.type as any) === ScriptType.PlutusV1 ||
                (bytes.type as any) === ScriptType.PlutusV2
            )
            {
                bytes = Buffer.from( (bytes as ScriptJsonFormat).cborHex, "hex" );
            }
            else
            {
                bytes = nativeScriptToCbor( bytes as NativeScript ).asBytes
            }
        }
        else bytes = BufferUtils.copy( bytes )

        if(
            scriptType === ScriptType.PlutusV1 ||
            scriptType === ScriptType.PlutusV2
        )
        {
            // unwrap up to 2 cbor bytes 
            try {
                let parsed = Cbor.parse( bytes );
                
                if( parsed instanceof CborBytes )
                {
                    bytes = parsed.buffer;
                    parsed = Cbor.parse( bytes );
                    if( parsed instanceof CborBytes )
                    {
                        bytes = parsed.buffer
                    }
                }
            }
            // assume bytes are flat
            catch {}
        }

        ObjectUtils.defineReadOnlyProperty(
            this,
            "bytes",
            bytes
        );

        let _hash: Hash28 = undefined as any;

        ObjectUtils.definePropertyIfNotPresent(
            this, "hash",
            {
                get: () => {
                    if( _hash !== undefined && _hash instanceof Hash28 ) return _hash.clone();

                    let scriptDataToBeHashed = [] as number[];

                    if( this.type === ScriptType.NativeScript )
                        scriptDataToBeHashed = [ 0x00 ].concat( Array.from( this.bytes ) );
                    else
                    {
                        const singleCbor = Array.from(
                            Cbor.encode(
                                new CborBytes(
                                    this.bytes
                                )
                            ).asBytes
                        );

                        scriptDataToBeHashed = [
                            this.type === ScriptType.PlutusV1 ? 0x01 : 0x02
                        ].concat( singleCbor );
                    }

                    _hash = new Hash28(
                        Buffer.from(
                            blake2b_224( scriptDataToBeHashed as byte[] )
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
            this.type as any,
            BufferUtils.copy( this.bytes )
        );
    }

    toJson()
    {
        if( this.type === ScriptType.NativeScript )
        {
            return nativeScriptFromCbor( new CborString( this.bytes ) )
        }
        else
        {
            return {
                type: this.type,
                description: "",
                cborHex: Cbor.encode(
                    new CborBytes(
                        Cbor.encode(
                            new CborBytes(
                                this.bytes
                            )
                        ).asBytes
                    )
                ).toString()
            }
        }
    }

    static fromJson( json: any & { type: string } ): Script
    {
        const t = json.type;

        if( t === ScriptType.PlutusV1 || t === ScriptType.PlutusV2 )
        {
            return new Script( t, Buffer.from( json.cborHex, "hex" ) );
        }

        return new Script(
            ScriptType.NativeScript,
            json as NativeScript
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.type === ScriptType.NativeScript )
        return new CborArray([
            new CborUInt(0),
            Cbor.parse( this.bytes )
        ]);

        return new CborArray([
            new CborUInt(
                this.type === ScriptType.PlutusV1 ? 1 : 2
            ),
            new CborBytes( this.bytes )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): Script
    {
        return Script.fromCborObj( Cbor.parse( forceCborString( cbor ) ) );
    }

    static fromCborObj( cObj: CborObj ): Script
    {
        if(!(
            cObj instanceof CborArray   &&
            cObj.array.length >= 2      &&
            cObj.array[0] instanceof CborUInt
        ))
        throw new InvalidCborFormatError("Script");

        const n = Number(cObj.array[0].num);
        const t = n === 0 ? ScriptType.NativeScript :
            n === 1 ? ScriptType.PlutusV1 :
            ScriptType.PlutusV2;

        if( t === ScriptType.NativeScript )
        return new Script( t, Cbor.encode( cObj.array[1] ).asBytes );

        if(!( cObj.array[1] instanceof CborBytes ))
        throw new InvalidCborFormatError("Script");

        return new Script( t, cObj.array[1].buffer );
    }
}