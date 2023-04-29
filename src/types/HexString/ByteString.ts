import { fromAscii, fromHex, isUint8Array, toAscii, toHex } from "@harmoniclabs/uint8array-utils";

function isHex( anyString: string ): boolean
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

function assert( condition: boolean, errorMessage: string | Error , addInfos?: any  ,...args: any[])
{
    if( condition ) return;
    
    args.length > 0 && console.error(...args);
    addInfos && console.error(addInfos);

    if( errorMessage instanceof Error )
    {
        throw errorMessage
    };

    throw new Error( errorMessage );
}

export class ByteString
{
    static isStrictInstance( bs: any ): bs is ByteString
    {
        return Object.getPrototypeOf( bs ) === ByteString.prototype
    }

    protected _bytes: Uint8Array;

    constructor( bs: string | Uint8Array | ByteString )
    {
        if( typeof bs === "string" )
        {
            // remove spaces
            bs = bs.trim().split(" ").join("");
            
            assert(
                isHex( bs ),
                "invalid hex input while constructing a ByteString: " + bs
            )
            // even length
            bs = fromHex( (bs.length % 2) === 1 ? "0" + bs : bs );
        }

        if(!(bs instanceof Uint8Array)) bs = bs.toBuffer();

        assert(
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
            isHex( str ) &&
            str.length % 2 === 0
        );
    }
}