import UPLCSerializable from "../UPLCEncoder/ineterfaces/UPLCSerializable";
import BitStream from "../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../types/bits/BinaryString";
import UPLCFlatUtils from "../../../utils/UPLCFlatUtils";

export default class Delay
    implements UPLCSerializable
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0001" )
        );
    }

    private _delayedTerm : UPLCTerm;

    get delayedTerm()
    {
        return this._delayedTerm;
    }

    constructor( toDelay: UPLCTerm )
    {
        this._delayedTerm = toDelay;
    }

    // toUPLCBitStream( ctx: UPLCSerializationContex ): BitStream
    // {
    //     const result = Delay.UPLCTag.clone();
    //     ctx.updateWithBitStreamAppend( result );
    //
    //     UPLCFlatUtils.appendTermAndUpdateContext(
    //         result,
    //         this.delayedTerm,
    //         ctx
    //     );
    //     
    //     return result;
    // }
}