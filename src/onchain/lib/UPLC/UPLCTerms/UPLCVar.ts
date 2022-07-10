import UPLCSerializable from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BinaryString from "../../../../types/bits/BinaryString";
import BitStream from "../../../../types/bits/BitStream";
import { UInteger } from "../../../../types/ints/Integer";
import UPLCEvaluableToPrimitive from "../UPLCPrimitive/interfaces/UPLCEvaluableToPrimitive";


export default class UPLCVar
    implements UPLCSerializable, UPLCEvaluableToPrimitive
{
    private static UPLCTag: BitStream = BitStream.fromBinStr(
        new BinaryString( "0000" )
    );

    private _deBruijn: UInteger;

    constructor( deBruijn: UInteger )
    {
        this._deBruijn = deBruijn;
    }

    toUPLCBitStream(): BitStream
    {
        const result = UPLCVar.UPLCTag.clone();
        result.append( this._deBruijn.toUPLCBitStream() );
        return result;
    }
}