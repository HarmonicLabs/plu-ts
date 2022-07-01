import BitStream from "../../../types/bits/BitStream";
import HexString from "../../../types/HexString";

export default
class UPLCScript
    extends HexString
{
    constructor( bytes: string | Buffer | BitStream )
    {
        if( bytes instanceof BitStream )
        {
            bytes = bytes.toBuffer()
        }
        if( typeof bytes === "string" )
        {
            bytes = bytes.split(" ").join("");
    
            // hex string length has to be even
            bytes = (bytes.length % 2) ? "0" + bytes : bytes;
        }
        
        super( bytes );
    }

}