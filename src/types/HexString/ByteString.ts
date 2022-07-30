import HexString from ".";
import UPLCSerializable, { UPLCSerializationContex } from "../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../bits/BitStream";


export default class ByteString extends HexString
    implements UPLCSerializable
{
    get [Symbol.toStringTag](): string
    {
        return "ByteString";
    }

    static isStrictInstance( any: any ): boolean
    {
        return any.__proto__ === ByteString.prototype
    }

    constructor( bs: string | Buffer )
    {
        if( typeof bs == "string" )
        {
            // remove spaces
            bs = bs.trim().split(" ").join("");
            // even length
            bs = (bs.length % 2) === 1 ? "0" + bs : bs;
        }

        super( bs );
    }

    /**
     * latest specification (**_section D.2.5 Bytestrings; page 27_**)
     * specifies how bytestrings are byte-alligned before and the first byte indicates the length
     * 
     * **this function takes care of the length AND padding**
     * 
     */
    toUPLCBitStream( ctx: UPLCSerializationContex ): BitStream
    {
        let missingBytes = this.asString;
        const hexChunks: string[] = [];

        while( (missingBytes.length / 2) > 0b1111_1111 )
        {
            hexChunks.push( "ff" + missingBytes.slice( 0, 255 * 2 ) );
            missingBytes = missingBytes.slice( 255 * 2 );
        }

        if( missingBytes.length !== 0 )
        {
            hexChunks.push(
                (missingBytes.length / 2).toString(16).padStart( 2, '0' ) +
                missingBytes
            );
        }
        
        // end chunk
        hexChunks.push( "00" );

        const nPadBits = 8 - (ctx.currLength % 8);

        // add initial padding as needed by context
        const result = BitStream.fromBinStr(
            "1".padStart( nPadBits , '0' )
        );

        // append chunks
        result.append(
            new BitStream(
                Buffer.from(
                    hexChunks.join(''),
                    "hex"
                ),
                0
            )
        );

        return result; 
    }
}