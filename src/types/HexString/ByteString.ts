import HexString from ".";
import UPLCSerializable from "../../serialization/flat/ineterfaces/UPLCSerializable";
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
     * this function takes care of the length
     * 
     * if this ```BitStream``` needs to be appended to an other that is intended to be an ```UPLCScript```
     * then the ```BitStream``` to append the result of this method is assumed to be byte alligned
     * 
     * so in order to append a ```ByteString``` to a ```BitStream``` in the intended way the following code should be runt
     * ```ts
     * const myBits: BitStream = new BitStream()
     * const byBytes: ByteString = new BytesTring( "abcd" );
     * 
     * BitStream.padToByte( myBits );
     * myBits.append( myBytes.toUPLCBitStream() );
     * 
     * ```
     * 
     */
    toUPLCBitStream(): BitStream
    {
        let missingBytes = this.asString;
        const hexChunks: string[] = [];

        while( missingBytes.length > 0b1111_1111 )
        {
            hexChunks.push( "ff" + missingBytes.slice( 0, 255 * 2 ) );
            missingBytes = missingBytes.slice( 255 * 2 );
        }

        if( missingBytes.length !== 0 )
        {
            hexChunks.push(
                missingBytes.length.toString(16).padStart( 2, '0' ) +
                missingBytes
            );
        }
        
        hexChunks.push( "00" );

        return new BitStream(
            Buffer.from(
                hexChunks.join(''),
                "hex"
            ),
            0
        );
    }
}