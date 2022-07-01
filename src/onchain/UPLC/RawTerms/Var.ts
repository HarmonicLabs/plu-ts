import UPLCSerializable from "../../../serialization/flat/ineterfaces/UPLCSerializable";
import UPLCTaggable from "../../../serialization/flat/ineterfaces/UPLCTaggable";
import { BitOffset } from "../../../types/bits/Bit";
import BitStream from "../../../types/bits/BitStream";
import Integer from "../../../types/Integer";


export default class Var
    implements UPLCTaggable, UPLCSerializable
{
    private _deBruijn: Integer;

    constructor( deBruijn: Integer )
    {
        this._deBruijn = deBruijn;
    }
    getUPLCTag: (startOffset?: BitOffset | undefined) => BitStream;
    toUPLCBitStream: (startOffset?: BitOffset | undefined) => BitStream;

}