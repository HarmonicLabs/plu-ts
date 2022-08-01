import HexString from ".";

export default class ByteString extends HexString
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
   
}