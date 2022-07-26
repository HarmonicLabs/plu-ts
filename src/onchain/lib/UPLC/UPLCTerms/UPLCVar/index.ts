import UPLCSerializable from "../../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BinaryString from "../../../../../types/bits/BinaryString";
import BitStream from "../../../../../types/bits/BitStream";
import { UInteger } from "../../../../../types/ints/Integer";
import JsRuntime from "../../../../../utils/JsRuntime";


export default class UPLCVar
    implements UPLCSerializable
{
    private static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0000" )
        );
    }

    private _deBruijn: UInteger;

    get deBruijn(): UInteger
    {
        return this._deBruijn;
    }

    constructor( deBruijn: UInteger )
    {
        JsRuntime.assert(
            deBruijn.asBigInt >= BigInt( 1 ),
            "only lambdas are allowed to have 0-indexed variables as DeBruijn; while creating an 'UPLCVar' instance, got: "
                + deBruijn.asBigInt.toString()
        );
        
        this._deBruijn = deBruijn;
    }

    toUPLCBitStream(): BitStream
    {
        const result = UPLCVar.UPLCTag.clone();
        result.append( this.deBruijn.toUPLCBitStream() );
        return result;
    }
}