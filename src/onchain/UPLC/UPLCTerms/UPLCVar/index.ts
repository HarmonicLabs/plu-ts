import JsRuntime from "../../../../utils/JsRuntime";

import { BinaryString } from "../../../../types/bits/BinaryString";
import { BitStream } from "../../../../types/bits/BitStream";
import { Cloneable } from "../../../../types/interfaces/Cloneable";
import { CanBeUInteger, forceBigUInt } from "../../../../types/ints/Integer";

export class UPLCVar
    implements Cloneable<UPLCVar>
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0000" )
        );
    }

    private _deBruijn: bigint;
    get deBruijn(): bigint { return this._deBruijn; }

    constructor( deBruijn: CanBeUInteger )
    {
        this._deBruijn = forceBigUInt( deBruijn );

        JsRuntime.assert(
            this._deBruijn >= BigInt( 0 ),
            "invalid deBruijn index; while creating 'UPLCVar' instance, deBruijn index was: "
                + this._deBruijn
        );
    }

    clone(): UPLCVar
    {
        return new UPLCVar( this.deBruijn );
    }

}