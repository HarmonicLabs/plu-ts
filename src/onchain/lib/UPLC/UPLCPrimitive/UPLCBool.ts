import UPLCSerializable from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BinaryString from "../../../../types/bits/BinaryString";
import BitStream from "../../../../types/bits/BitStream";
import JsRuntime from "../../../../utils/JsRuntime";

export class UPLCBool
    implements UPLCSerializable
{
private _bool: boolean;

constructor( bool: boolean )
{
    JsRuntime.assert(
        typeof bool === "boolean",
        "expected boolean in order to construct a 'UPLCBool' instance; got: "+ bool.toString()
    );
    
    this._bool = bool;
}

toUPLCBitStream(): BitStream
{
    return BitStream.fromBinStr(
        new BinaryString( this._bool ? "1" : "0" )
    );
}
}