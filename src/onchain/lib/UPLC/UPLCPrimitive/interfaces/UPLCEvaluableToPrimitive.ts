import UPLCSerializable from "../../../../../serialization/flat/ineterfaces/UPLCSerializable"
import { TypeOfUPLCPrimitive } from ".."

/**
 * **_WARN:_** "Evaluable" express the _possibilty_ of a primitive evalutation
 */
export default interface UPLCEvaluableToPrimitive extends UPLCSerializable
{
    /**
     * @return {TypeOfUPLCPrimitive | undefined} a ```TypeOfUPLCPrimitive``` of @type {string} indicating a primitive 
     * 
     * or ```undefined``` indicating it doesn't evalueate to a primitive
     */
    evaluatesToPrimitive: () => TypeOfUPLCPrimitive | undefined
}