import UPLCSerializable from "../UPLCEncoder/ineterfaces/UPLCSerializable";
import BitStream from "../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../types/bits/BinaryString";
import Delay from "./Delay";

export default class ErrorUPLC
    implements UPLCSerializable
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0110" )
        );
    } 

    constructor() {};
}