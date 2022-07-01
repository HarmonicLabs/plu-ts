import UPLCTaggable from "../../../serialization/flat/ineterfaces/UPLCTaggable";
import UPLCSerializable from "../../../serialization/flat/ineterfaces/UPLCSerializable";
import RawTerm from "../RawTerm";
import BitStream from "../../../types/bits/BitStream";
import { BitOffset } from "../../../types/bits/Bit";

export default class Delay
    implements UPLCTaggable, UPLCSerializable
{
    static UPLCTag: number = 1;

    private _delayedTerm : RawTerm;

    constructor( rawTerm: RawTerm )
    {
        this._delayedTerm = rawTerm;
    }

    getUPLCTag(startOffset?: BitOffset | undefined): BitStream
    {

    }

    toUPLCBitStream(startOffset?: BitOffset | undefined): BitStream
    {
        const result = this.getUPLCTag().clone();
        result.append( this._delayedTerm.toUPLCBitStream() );
        return result;
    }
}