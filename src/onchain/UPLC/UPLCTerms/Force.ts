import UPLCSerializable, { UPLCSerializationContex } from "../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../types/bits/BinaryString";
import { forceInByteOffset } from "../../../types/bits/Bit";
import UPLCFlatUtils from "../../../utils/UPLCFlatUtils";

export default class Force
    implements UPLCSerializable
{
    private static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0101" )
        );
    }

    private _toForce : UPLCTerm;

    get termToForce(): UPLCTerm
    {
        return this._toForce;
    }

    /**
     * ```Force``` takes any ```UPLCTerm``` as argument;
     * not necessarely ```Delayed``` ones, a great example are
     * "type parametrized" builtin-functions
     */
    constructor( rawTerm: UPLCTerm )
    {
        this._toForce = rawTerm;
    }

    toUPLCBitStream( ctx: UPLCSerializationContex ): BitStream
    {
        const result = Force.UPLCTag.clone();
        ctx.updateWithBitStreamAppend( result );

        UPLCFlatUtils.appendTermAndUpdateContext(
            result,
            this.termToForce,
            ctx
        );

        return result;
    }
}