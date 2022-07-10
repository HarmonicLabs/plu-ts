import UPLCSerializable from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../../types/bits/BinaryString";
import Delay from "./Delay";
import UPLCEvaluableToPrimitive from "../UPLCPrimitive/interfaces/UPLCEvaluableToPrimitive";

export default class ErrorUPLC
    implements UPLCSerializable, UPLCEvaluableToPrimitive
{
    private static UPLCTag: BitStream = BitStream.fromBinStr(
        new BinaryString( "0110" )
    );

    private _errArg : UPLCTerm;

    /**
     * ```Force``` takes any ```UPLCTerm``` as argument that ultimately **evaluates** to a Deleyed one, not only ```Delay``` terms
     */
    constructor( rawTerm: UPLCTerm )
    {
        this._errArg = rawTerm;
    }

    toUPLCBitStream(): BitStream
    {
        const result = ErrorUPLC.UPLCTag.clone();
        result.append( this._errArg.toUPLCBitStream() );
        return result;
    }
}