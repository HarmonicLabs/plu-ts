import JsRuntime from "../../../utils/JsRuntime";

import { Cbor } from "../../../cbor/Cbor";
import { CborObj } from "../../../cbor/CborObj";
import { CborBytes } from "../../../cbor/CborObj/CborBytes";
import { CanBeCborString, forceCborString } from "../../../cbor/CborString";
import { InvalidCborFormatError } from "../../../errors/InvalidCborFormatError";
import { Hash, canBeHashInstance } from "../Hash";
import { isHex } from "../../../types/HexString";

export type CanBeHash32 = string | Uint8Array | Hash32;

export function canBeHash32( stuff: string | Uint8Array | Hash32 ): boolean
{
    if( typeof stuff === "string" )
    {
        return stuff.length === 64 && isHex( stuff )
    }

    if( stuff instanceof Uint8Array )
    {
        return stuff.length === 32;
    }

    return canBeHashInstance( stuff ) && canBeHash32( stuff.toBuffer() )
}

export class Hash32 extends Hash
{
    constructor( bs: string | Uint8Array | Hash32 , className: string = "Hash32" )
    {
        super( bs instanceof Hash32 ? bs.toBuffer() : bs );

        JsRuntime.assert(
            this._bytes.length === 32,
            "'" + className + "' must be an hash of length 32; length was: " + this._bytes.length
        );
    }

    static fromCbor( cStr: CanBeCborString ): Hash32
    {
        return Hash32.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): Hash32
    {
        if(!(cObj instanceof CborBytes ))
        throw new InvalidCborFormatError("Hash");

        return new Hash32( cObj.buffer )
    }
    
}