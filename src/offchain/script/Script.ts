import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";

import { blake2b_224, byte } from "../../crypto";
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
import { CborUInt } from "../../cbor/CborObj/CborUInt";
import { InvalidCborFormatError } from "../../errors/InvalidCborFormatError";
import { fromHex, isUint8Array } from "@harmoniclabs/uint8array-utils";

export const enum ScriptType {
    NativeScript = "NativeScript",
    PlutusV1 = "PlutusScriptV1",
    PlutusV2 = "PlutusScriptV2"
}

export type PlutusScriptType = ScriptType.PlutusV1 | ScriptType.PlutusV2 | "PlutusScriptV1" | "PlutusScriptV2"

export type LitteralScriptType = ScriptType | "NativeScript" | "PlutusScriptV1" | "PlutusScriptV2"

export interface PlutusScriptJsonFormat {
    type: PlutusScriptType,
    description?: string,
    cborHex: string
}

export class Script<T extends LitteralScriptType = LitteralScriptType>
    implements Cloneable<Script<T>>, ToJson, ToCbor
{
    readonly type!: T;
    readonly bytes!: Uint8Array;
    /**
     * format expected by `cardano-cli`
    **/
    readonly cbor!: T extends ScriptType.NativeScript ? never : CborString;
    readonly hash!: Hash28;

    constructor( scriptType: T, bytes: Uint8Array | (T extends ScriptType.NativeScript ? NativeScript : PlutusScriptJsonFormat) )
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

        if( !isUint8Array(bytes) )
        {
            if(
                (bytes.type as any) === ScriptType.PlutusV1 ||
                (bytes.type as any) === ScriptType.PlutusV2
            )
            {
                bytes = fromHex( (bytes as PlutusScriptJsonFormat).cborHex );
            }
            else
            {
                bytes = nativeScriptToCbor( bytes as NativeScript ).toBuffer()
            }
        }
        else bytes = bytes.slice()

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

        ObjectUtils.defineReadOnlyProperty(
            this,
            "cbor",
            this.type === ScriptType.NativeScript ? new CborString( bytes ) :
            Cbor.encode(
                new CborBytes(
                    Cbor.encode(
                        new CborBytes(
                            bytes.slice()
                        )
                    ).toBuffer()
                )
            )
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
                            ).toBuffer()
                        );

                        scriptDataToBeHashed = [
                            this.type === ScriptType.PlutusV1 ? 0x01 : 0x02
                        ].concat( singleCbor );
                    }

                    _hash = new Hash28(
                        Uint8Array.from(
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
            this.bytes.slice()
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
                        ).toBuffer()
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
            return new Script( t, fromHex( json.cborHex ) );
        }

        return new Script(
            ScriptType.NativeScript,
            json as NativeScript
        );
    }

    /**
     * format specified in the ledger CDDL
    **/
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    /**
     * format specified in the ledger CDDL
    **/
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
            new CborBytes(
                Cbor.encode(
                    new CborBytes( this.bytes.slice() )
                ).toBuffer()
            )
        ]);
    }

    static fromCbor( cbor: CanBeCborString ): Script
    {
        return Script.fromCborObj( Cbor.parse( forceCborString( cbor ) ) );
    }

    static fromCborObj( cObj: CborObj, defType: ScriptType = ScriptType.PlutusV2 ): Script
    {
        // read tx_witness_set
        if( cObj instanceof CborBytes )
        {
            return new Script(
                defType,
                Cbor.encode( cObj ).toBuffer()
            );
        }

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
        return new Script( t, Cbor.encode( cObj.array[1] ).toBuffer() );

        if(!( cObj.array[1] instanceof CborBytes ))
        throw new InvalidCborFormatError("Script");

        return new Script( t, cObj.array[1].buffer );
    }
}