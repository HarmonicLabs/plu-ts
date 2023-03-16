import JsRuntime from "../../utils/JsRuntime";

import { CanBeUInteger, forceUInteger } from "../../types/ints/Integer";
import { Cbor } from "../../cbor/Cbor";
import { CborObj } from "../../cbor/CborObj";
import { CborArray } from "../../cbor/CborObj/CborArray";
import { CborBytes } from "../../cbor/CborObj/CborBytes";
import { CborUInt } from "../../cbor/CborObj/CborUInt";
import { CborString } from "../../cbor/CborString";
import { BasePlutsError } from "../../errors/BasePlutsError";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { toHex } from "@harmoniclabs/uint8array-utils";

export type NativeScript
    = ScriptSignature
    | ScriptAll
    | ScriptAny
    | ScriptAtLeast
    | ScriptAfter
    | ScriptBefore

export interface ScriptSignature {
    type: "sig",
    keyHash: Hash28 | string
}

export interface ScriptAll {
    type: "all",
    scripts: NativeScript[]
}

export interface ScriptAny {
    type: "any",
    scripts: NativeScript[]
}

export interface ScriptAtLeast {
    type: "atLeast",
    required: CanBeUInteger,
    scripts: NativeScript[]
}

export interface ScriptAfter {
    type: "after",
    slot: CanBeUInteger
}

export interface ScriptBefore {
    type: "before",
    slot: CanBeUInteger
}

export function nativeScriptToCborObj( nativeScript: NativeScript ): CborArray
{
    const type = nativeScript.type;

    if( type === "sig" )
    {
        const keyHash = nativeScript.keyHash;

        return new CborArray([
            new CborUInt( 0 ),
            new CborBytes(
                (
                    keyHash instanceof Hash28 ?
                        keyHash :
                        new Hash28( keyHash )
                ).toBuffer()
            )
        ]);
    }
    if( type === "all" || type === "any" )
        return new CborArray([
            new CborUInt( type === "all" ? 1 : 2 ),
            new CborArray(
                nativeScript.scripts.map( nativeScriptToCborObj )
            )
        ]);
    if( type === "atLeast" )
        return new CborArray([
            new CborUInt( 3 ),
            new CborUInt( forceUInteger( nativeScript.required ).asBigInt ),
            new CborArray(
                nativeScript.scripts.map( nativeScriptToCborObj )
            )
        ]);
    if( type === "after" || type === "before" )
        return new CborArray([
            new CborUInt( type === "after" ? 4 : 5 ),
            new CborUInt( forceUInteger( nativeScript.slot ).asBigInt ),
        ]);

    throw JsRuntime.makeNotSupposedToHappenError(
        "unmatched 'nativeScript.type' while converting to cbor"
    );
}
export function nativeScriptToCbor( nativeScript: NativeScript ): CborString
{
    return Cbor.encode( nativeScriptToCborObj( nativeScript ) );
}

const notNativeScriptError = new BasePlutsError(
    "ill formed native script to deserialize"
);

export function nativeScriptFromCborObj( cbor: CborObj ): NativeScript
{
    if(!(cbor instanceof CborArray))
    throw notNativeScriptError;

    const [ _type, f1, f2 ] = cbor.array;

    if( !( _type instanceof CborUInt ) )
    throw notNativeScriptError

    const type = Number( _type.num );

    let scripts: NativeScript[];

    switch( type )
    {
        case 0:
            if( !(f1 instanceof CborBytes) )
            throw notNativeScriptError;

            const pkh = toHex( f1.buffer );

            return {
                type: "sig",
                keyHash: pkh
            }
        case 1:
        case 2:
            if( !(f1 instanceof CborArray) )
            throw notNativeScriptError;

            scripts = f1.array.map( nativeScriptFromCborObj as any );

            return {
                type: type === 1 ? "all" : "any",
                scripts: scripts
            }
        case 3:

            if( !(f1 instanceof CborUInt) )
            throw notNativeScriptError;

            if( !(f2 instanceof CborArray) )
            throw notNativeScriptError;

            const n = Number( f1.num )

            scripts = f2.array.map( nativeScriptFromCborObj as any );

            return {
                type: "atLeast",
                required: n,
                scripts: scripts
            }
        case 4:
        case 5:

            if( !(f1 instanceof CborUInt) )
            throw notNativeScriptError;

            return {
                type: type === 4 ? "after" : "before",
                slot: Number( f1.num )
            }
        
        default:
            throw notNativeScriptError;
    }
}
export function nativeScriptFromCbor( cbor: CborString ): NativeScript
{
    return nativeScriptFromCborObj( Cbor.parse( cbor ) as any );
}