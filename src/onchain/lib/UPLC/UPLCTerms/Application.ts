import UPLCSerializable from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../../types/bits/BinaryString";
import UPLCEvaluableToPrimitive from "../UPLCPrimitive/interfaces/UPLCEvaluableToPrimitive";

export default class Application
    implements UPLCSerializable, UPLCEvaluableToPrimitive
{
    private static UPLCTag: BitStream = BitStream.fromBinStr(
        new BinaryString( "0011" )
    );

    private _func: UPLCTerm
    private _arg : UPLCTerm;

    constructor( func: UPLCTerm, arg: UPLCTerm )
    {
        this._func = func;
        this._arg = arg;
    }

    toUPLCBitStream(): BitStream
    {
        const result = Application.UPLCTag.clone();
        result.append( this._func.toUPLCBitStream() );
        result.append( this._arg.toUPLCBitStream() );
        return result;
    }
}