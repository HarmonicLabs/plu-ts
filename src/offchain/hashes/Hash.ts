import ObjectUtils from "../../utils/ObjectUtils";
import JsRuntime from "../../utils/JsRuntime";

import { Cbor } from "../../cbor/Cbor";
import { CborObj } from "../../cbor/CborObj";
import { CborBytes } from "../../cbor/CborObj/CborBytes";
import { CborString, CanBeCborString, forceCborString } from "../../cbor/CborString";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import { InvalidCborFormatError } from "../../errors/InvalidCborFormatError";
import { Data } from "../../types/Data/Data";
import { DataB } from "../../types/Data/DataB";
import { ToData } from "../../types/Data/toData/interface";
import { HexString } from "../../types/HexString";
import { Cloneable } from "../../types/interfaces/Cloneable";
import { fromAscii, fromHex, isUint8Array, toAscii, toHex } from "../../uint8Array";


export class Hash
    implements Cloneable<Hash>, ToCbor, ToData
{
    static isStrictInstance( bs: any ): bs is Hash
    {
        return Object.getPrototypeOf( bs ) === Hash.prototype
    }

    protected get _bytes(): Uint8Array
    {
        const result = (this as any).__bytes;
        if( result === undefined )
        {
            ObjectUtils.defineReadOnlyProperty(
                this,
                "__bytes",
                fromHex( this._str )
            );
            return (this as any).__bytes.slice();
        }
        if( !isUint8Array( result ) )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "Hash.__bytes was not a Uint8Array"
            );
        }

        return result;
    }

    protected get _str(): string
    {
        const result = (this as any).__str;
        if( result === undefined )
        {
            ObjectUtils.defineReadOnlyProperty(
                this,
                "__str",
                toHex( this._bytes )
            );
            return (this as any).__str;
        }
        if( !(typeof result === "string" && result.length % 2 === 0 ) )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "Hash.__str was not a even string"
            );
        }

        return result;
    }

    constructor( bs: string | Uint8Array )
    {
        if( typeof bs == "string" )
        {
            // remove spaces
            bs = bs.trim().split(" ").join("");
            
            JsRuntime.assert(
                HexString.isHex( bs ),
                "invalid hex input while constructing a Hash: " + bs
            );

            // even length
            ObjectUtils.defineReadOnlyProperty(
                this,
                "__str",
                (bs.length % 2) === 1 ? "0" + bs : bs
            );
            return;
        }

        JsRuntime.assert(
            isUint8Array( bs ),
            "invalid Uint8Array input while constructing a Hash"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "__bytes",
            bs
        );
    }

    /**
     * @deprecated use `toString()` instead
     */
    get asString(): string
    {
        return this._str;
    }

    toString(): string
    {
        return this._str;
    }

    /**
     * @deprecated use `toBuffer()` instead
     */
    get asBytes(): Uint8Array
    {
        return this._bytes;
    }

    toBuffer(): Uint8Array
    {
        return this._bytes;
    }

    /**
     * @deprecated use `toBuffer()` instead
     */
    toBytes(): Uint8Array
    {
        return this._bytes;
    }

    clone(): Hash
    {
        return new Hash( this._str );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborBytes( this.asBytes )
    }

    static fromCbor( cStr: CanBeCborString ): Hash
    {
        return Hash.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): Hash
    {
        if(!(cObj instanceof CborBytes ))
        throw new InvalidCborFormatError("Hash");

        return new Hash( cObj.buffer )
    }

    toData(): Data
    {
        return new DataB( this.toBuffer() );
    }

    public static fromAscii( asciiStr: string ): Hash
    {
        return new Hash( fromAscii( asciiStr ) );
    }

    public static toAscii( bStr: Hash ): string
    {
        return toAscii( bStr.toBuffer() )
    }

    public static isValidHexValue( str: string ): boolean
    {
        return (
            HexString.isHex( str ) &&
            str.length % 2 === 0
        );
    }
}