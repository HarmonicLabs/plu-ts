import BufferUtils from "../../utils/BufferUtils";
import JsRuntime from "../../utils/JsRuntime";

import {Cloneable} from "../interfaces/Cloneable";
import {HexString} from ".";
import { fromAscii, fromHex, isUint8Array, toAscii, toHex } from "../../uint8Array";

export class ByteString
    implements Cloneable<ByteString>
{
    static isStrictInstance( bs: any ): bs is ByteString
    {
        return Object.getPrototypeOf( bs ) === ByteString.prototype
    }

    protected _bytes: Uint8Array;

    constructor( bs: string | Uint8Array )
    {
        if( typeof bs === "string" )
        {
            // remove spaces
            bs = bs.trim().split(" ").join("");
            
            JsRuntime.assert(
                HexString.isHex( bs ),
                "invalid hex input while constructing a ByteString: " + bs
            )
            // even length
            this._bytes = fromHex( (bs.length % 2) === 1 ? "0" + bs : bs );
            return;
        }

        JsRuntime.assert(
            isUint8Array( bs ),
            "invalid Uint8Array input while constructing a ByteString"
        );

        this._bytes = bs;
    }

    /**
     * @deprecated use `toString()` instead
     */
    get asString(): string
    {
        return toHex( this._bytes );
    }

    toString(): string
    {
        return toHex( this._bytes );
    }

    /**
     * @deprecated use `toBuffer()` instead
     */
    get asBytes(): Uint8Array
    {
        return this._bytes.slice();
    }

    toBuffer(): Uint8Array
    {
        return this._bytes.slice();
    }

    clone(): ByteString
    {
        return new ByteString( this._bytes.slice() );
    }

    public static fromAscii( asciiStr: string ): ByteString
    {
        return new ByteString( fromAscii( asciiStr ) );
    }

    public static toAscii( bStr: ByteString ): string
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