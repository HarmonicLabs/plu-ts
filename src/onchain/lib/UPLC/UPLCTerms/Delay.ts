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

    constructor( rawTerm: UPLCTerm )
    {
        this._delayedTerm = rawTerm;
    }

    toUPLCBitStream(): BitStream
    {
        const result = Delay.UPLCTag.clone();
        result.append( this._delayedTerm.toUPLCBitStream() );
        return result;
    }
}