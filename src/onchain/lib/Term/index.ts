import UPLCSerializable from "../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../types/bits/BitStream";
import PlutsType from "../PlutsType";


export default class Term<PlutsT extends PlutsType>
    implements UPLCSerializable
{
    private _term: PlutsT

    constructor( term: PlutsT )
    {

    }
    
    toUPLCBitStream(): BitStream
    {
        return this._term.toUPLCBitStream();
    }

    /* IDEA
    match<ReturnPlutsT extends PlutsType>( term: PlutsT ): Term<ReturnPlutsT>
    {

    }
    // */
}