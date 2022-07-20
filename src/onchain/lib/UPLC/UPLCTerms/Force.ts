import UPLCSerializable from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../../types/bits/BinaryString";

export default class Force
    implements UPLCSerializable
{
    private static UPLCTag: BitStream = BitStream.fromBinStr(
        new BinaryString( "0101" )
    );

    private _toForce : UPLCTerm;

    get termToForce(): UPLCTerm
    {
        return this._toForce;
    }

    /**
     * ```Force``` takes any ```UPLCTerm``` as argument;
     * not necessarely ```Delayed``` ones, a great example are
     * "type parametrized" builtin-functions
     */
    constructor( rawTerm: UPLCTerm )
    {
        this._toForce = rawTerm;
    }

    toUPLCBitStream(): BitStream
    {
        const result = Force.UPLCTag.clone();
        result.append( this.termToForce.toUPLCBitStream() );
        return result;
    }
}