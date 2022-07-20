import UPLCSerializable from "../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../types/bits/BitStream";
import PlutsType from "../PlutsType";
import { TypeOfUPLCPrimitive } from "../UPLC/UPLCPrimitive";
import UPLCEvaluableToPrimitive from "../UPLC/UPLCPrimitive/interfaces/UPLCEvaluableToPrimitive";


export default class Term<PlutsT extends PlutsType>
    implements UPLCSerializable, UPLCEvaluableToPrimitive
{
    private _term: PlutsT

    constructor( term: PlutsT )
    {

    }
    
    toUPLCBitStream(): BitStream
    {
        return this._term.toUPLCBitStream();
    }

    evaluatesToPrimitive(): TypeOfUPLCPrimitive | undefined
    {
        return this._term.evaluatesToPrimitive();
    }

    /* IDEA
    match<ReturnPlutsT extends PlutsType>( term: PlutsT ): Term<ReturnPlutsT>
    {

    }
    // */
}