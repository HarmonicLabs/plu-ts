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

    toUPLCBitStream(): BitStream
    {
        /* 
        we can't use 'UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream' here
        because converting a bytestring like "0x000002abc..." to a bigint
        would lose track of the starting zeroes
        */
        /*
        latest specification specifies how bytestrings are bytealigned before and the first byte indicates the length
        */

        
    }
}