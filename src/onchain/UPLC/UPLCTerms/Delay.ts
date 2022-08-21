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

    private _delayedTerm : UPLCTerm;

    get delayedTerm()
    {
        return this._delayedTerm;
    }

    constructor( toDelay: UPLCTerm )
    {
        this._delayedTerm = toDelay;
    }
}