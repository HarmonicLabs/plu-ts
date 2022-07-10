import UPLCSerializable from "../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../../types/bits/BinaryString";
import Var from "./UPLCVar";

export default class Lambda
    implements UPLCSerializable
{
    private static UPLCTag: BitStream = BitStream.fromBinStr(
        new BinaryString( "0010" )
    );

    private _boundedVar: Var
    private _body : UPLCTerm;

    constructor( boundedVar: Var, body: UPLCTerm )
    {
        this._boundedVar = boundedVar;
        this._body = body
    }

    toUPLCBitStream(): BitStream
    {
        const result = Lambda.UPLCTag.clone();
        result.append( this._boundedVar.toUPLCBitStream() );
        result.append( this._body.toUPLCBitStream() );
        return result;
    }
}