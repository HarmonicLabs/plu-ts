import BitStream from "../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../types/bits/BinaryString";

export default class Delay
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0001" )
        );
    }

    public delayedTerm: UPLCTerm;

    constructor( toDelay: UPLCTerm )
    {
        this.delayedTerm = toDelay;
    }
}