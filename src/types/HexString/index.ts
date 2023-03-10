import {HexStringError} from "../../errors/PlutsTypeError/HexStringError";
import { fromAscii, fromHex, isUint8Array, toAscii, toHex } from "@harmoniclabs/uint8array-utils";

export type hex = string & { __hex_string__ : never };

export function isHex( anyString: string ): anyString is hex
{
    // always think in javasript
    if( typeof anyString !== "string" ) return false;
    
    const str = anyString.toLowerCase();
    const validHex = "987654321abcdef0";

    for( let i = 0; i < str.length; i++)
    {
        if( !validHex.includes(str[i]) ) return false;
    }

    // if false has not been returned yet, then it must be a valid hex
    return true;
}

export class HexString
{
    get [Symbol.toStringTag](): string
    {
        return "HexString";
    }

    private _hex: hex;

    protected set hex( hexString: string )
    {
        const hex = hexString.toLowerCase();
        HexString._assertHex( hex );
        this._hex = hex as hex;
    }

    constructor( hexString : string | Uint8Array )
    {
        if( isUint8Array( hexString ) )
        {
            this._hex = toHex( hexString ) as hex;
            return;
        }

        // remove spaces
        hexString = hexString.trim().split(" ").join("").toLowerCase();

        // if it wasn't a Uint8Array originally, the string may contain invalid chars
        HexString._assertHex( hexString );

        this._hex = hexString.toLowerCase() as hex;
    }

    /**
     * @deprecated use `toString()` instead
     */
    get asString(): hex
    {
        return this._hex;
    }
    
    toString(): hex
    {
        return this._hex
    }

    /**
     * @deprecated use `toBuffer()` instead
     */
    get asBytes(): Uint8Array
    {
        return fromHex( this._hex );
    }

    toBuffer(): Uint8Array
    {
        return fromHex( this._hex )
    }

    /**
     * 
     * @param anyString assumed hex string
     * @returns true if the string can be interpreted as hexadecimal value
     */
    public static isHex( anyString: string ): anyString is hex
    {
        return isHex( anyString );
    }

    private static _assertHex( str: string ): void
    {
        if( !HexString.isHex( str ) ) throw new HexStringError("provided string is expected to be a valid hex value; inpur was: " + str);
    }

    public static fromAscii( asciiStr: string ): HexString
    {
        return new HexString( fromAscii( asciiStr ) );
    }

    public static toAscii( hexStr: HexString ): string
    {
        return toAscii( hexStr.asBytes )
    }

    public static formBytes( buffer: Uint8Array ): HexString
    {
        return new HexString( toHex( buffer ) )
    }
    
}