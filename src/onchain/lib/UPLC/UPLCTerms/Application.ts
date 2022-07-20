import UPLCSerializable from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../../types/bits/BinaryString";

export default class Application
    implements UPLCSerializable
{
    private static UPLCTag: BitStream = BitStream.fromBinStr(
        new BinaryString( "0011" )
    );

    private _func: UPLCTerm
    private _arg : UPLCTerm;

    get funcTerm(): UPLCTerm
    {
        return this._func;
    }

    get argTerm(): UPLCTerm
    {
        return this._arg;
    }

    constructor( func: UPLCTerm, arg: UPLCTerm )
    {
        this._func = func;
        this._arg = arg;
    }

    toUPLCBitStream(): BitStream
    {
        const result = Application.UPLCTag.clone();
        result.append( this.funcTerm.toUPLCBitStream() );
        result.append( this.argTerm.toUPLCBitStream() );
        return result;
    }
}