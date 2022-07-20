import UPLCSerializable from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../../types/bits/BinaryString";

export default class Delay
    implements UPLCSerializable
{
    private static UPLCTag: BitStream = BitStream.fromBinStr(
        new BinaryString( "0001" )
    );

    private _delayedTerm : UPLCTerm;

    get delayedTerm()
    {
        return this._delayedTerm;
    }

    constructor( toDelay: UPLCTerm )
    {
        this._delayedTerm = toDelay;
    }

    toUPLCBitStream(): BitStream
    {
        const result = Delay.UPLCTag.clone();
        result.append( this.delayedTerm.toUPLCBitStream() );
        return result;
    }
}