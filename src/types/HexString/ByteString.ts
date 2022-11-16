import HexString from ".";
import BufferUtils from "../../utils/BufferUtils";
import JsRuntime from "../../utils/JsRuntime";
import Cloneable from "../interfaces/Cloneable";

export default class ByteString
    implements Cloneable<ByteString>
{
    get [Symbol.toStringTag](): string
    {
        return "ByteString";
    }

    static isStrictInstance( bs: any ): bs is ByteString
    {
        return Object.getPrototypeOf( bs ) === ByteString.prototype
    }

    private _bytes: Buffer;

    constructor( bs: string | Buffer )
    {
        if( typeof bs == "string" )
        {
            // remove spaces
            bs = bs.trim().split(" ").join("");
            
            JsRuntime.assert(
                HexString.isHex( bs ),
                "invalid hex input while constructing a ByteString: " + bs
            )
            // even length
            this._bytes = Buffer.from( (bs.length % 2) === 1 ? "0" + bs : bs , "hex" );
            return;
        }

        JsRuntime.assert(
            Buffer.isBuffer( bs ),
            "invalid Buffer input while constructing a ByteString"
        );

        this._bytes = bs;
    }

    get asString(): string
    {
        return this._bytes.toString( "hex" );
    }

    get asBytes(): Buffer
    {
        return BufferUtils.copy( this._bytes );
    }

    clone(): ByteString
    {
        return new ByteString( Buffer.from( this._bytes ) );
    }

    public static fromAscii( asciiStr: string ): ByteString
    {
        return new ByteString( Buffer.from( asciiStr, "ascii" ) );
    }

    public static toAscii( bStr: ByteString ): string
    {
        return bStr.asBytes.toString("ascii")
    }

}