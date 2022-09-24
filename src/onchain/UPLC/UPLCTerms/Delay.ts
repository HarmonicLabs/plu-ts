import BitStream from "../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../types/bits/BinaryString";
import Cloneable from "../../../types/interfaces/Cloneable";

export default class Delay
    implements Cloneable<Delay>
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

    clone(): Delay
    {
        return new Delay( this.delayedTerm.clone() )
    }
}