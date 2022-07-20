import UPLCSerializable from "../../../serialization/flat/ineterfaces/UPLCSerializable";
import UPLCEvaluableToPrimitive from "../UPLC/UPLCPrimitive/interfaces/UPLCEvaluableToPrimitive";
import UPLCTerm from "../UPLC/UPLCTerm";

export default interface PlutsType
    extends UPLCSerializable, UPLCEvaluableToPrimitive
{
    getRawTerm: () => UPLCTerm
}