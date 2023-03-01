import ObjectUtils from "../../utils/ObjectUtils";
import JsRuntime from "../../utils/JsRuntime";
import BufferUtils from "../../utils/BufferUtils";

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


export class Hash
    implements Cloneable<Hash>, ToCbor, ToData
{
    static isStrictInstance( bs: any ): bs is Hash
    {
        return Object.getPrototypeOf( bs ) === Hash.prototype
    }

    protected get _bytes(): Buffer
    {
        const result = (this as any).__bytes;
        if( result === undefined )
        {
            ObjectUtils.defineReadOnlyProperty(
                this,
                "__bytes",
                Buffer.from( this._str, "hex" )
            );
            return BufferUtils.copy( (this as any).__bytes );
        }
        if( !Buffer.isBuffer( result ) )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "Hash.__bytes was not a Buffer"
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
                this._bytes.toString("hex")
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

    constructor( bs: string | Buffer )
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
            Buffer.isBuffer( bs ),
            "invalid Buffer input while constructing a Hash"
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
    get asBytes(): Buffer
    {
        return this._bytes;
    }

    toBuffer(): Buffer
    {
        return this._bytes;
    }

    /**
     * @deprecated use `toBuffer()` instead
     */
    toBytes(): Buffer
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
        return new DataB( this.asBytes );
    }

    public static fromAscii( asciiStr: string ): Hash
    {
        return new Hash( Buffer.from( asciiStr, "ascii" ) );
    }

    public static toAscii( bStr: Hash ): string
    {
        return bStr.asBytes.toString("ascii")
    }

    public static isValidHexValue( str: string ): boolean
    {
        return (
            HexString.isHex( str ) &&
            str.length % 2 === 0
        );
    }
}