import BinaryString from "../../../../types/bits/BinaryString";
import BitStream from "../../../../types/bits/BitStream";
import { CanBeUInteger, forceUInteger, UInteger } from "../../../../types/ints/Integer";
import JsRuntime from "../../../../utils/JsRuntime";
import UPLCTerm from "../../UPLCTerm";


export default class UPLCVar
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0000" )
        );
    }

    private _deBruijn: UInteger;
    get deBruijn(): UInteger { return this._deBruijn; }

    constructor( deBruijn: CanBeUInteger )
    {
        this._deBruijn = forceUInteger( deBruijn );

        JsRuntime.assert(
            this._deBruijn.asBigInt >= BigInt( 0 ),
            "invalid deBruijn index; while creating 'UPLCVar' instance, deBruijn index was: "
                + this._deBruijn
        );
    }

}