import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborBytes from "../../cbor/CborObj/CborBytes";
import CborString from "../../cbor/CborString";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import HexString from "../../types/HexString";
import Cloneable from "../../types/interfaces/Cloneable";
import BufferUtils from "../../utils/BufferUtils";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";


export default class Hash
    implements Cloneable<Hash>, ToCbor
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

    get asString(): string
    {
        return this._str;
    }

    get asBytes(): Buffer
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