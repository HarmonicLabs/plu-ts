import BitStream from "../../../types/bits/BitStream";
import BinaryString from "../../../types/bits/BinaryString";

export default class ErrorUPLC
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0110" )
        );
    } 

    public msg?: string;
    
    constructor( msg?: string )
    {
        this.msg = msg;
    };

    clone(): ErrorUPLC
    {
        return new ErrorUPLC(this.msg);
    }
}