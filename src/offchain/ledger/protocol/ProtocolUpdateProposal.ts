import { canBeUInteger } from "../../../types/ints/Integer";
import Epoch from "../Epoch";
import ProtocolParamters, { isPartialProtocolParameters } from "./ProtocolParameters";

export type ProtocolUpdateProposal = [ ProtocolParametersUpdate, Epoch ];

export default ProtocolUpdateProposal;

export type ProtocolParametersUpdate = Partial<ProtocolParamters>;

export const isProtocolParametersUpdate: ( something: object ) => something is ProtocolParametersUpdate = isPartialProtocolParameters;

export function isProtocolUpdateProposal( something: object ): something is ProtocolUpdateProposal
{
    return (
        Array.isArray( something ) &&
        something.length >= 2 &&
        isPartialProtocolParameters( something[0] ) &&
        canBeUInteger( something[1] )
    );
}