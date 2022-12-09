import CborObj from "../../../cbor/CborObj";
import CborArray from "../../../cbor/CborObj/CborArray";
import CborMap from "../../../cbor/CborObj/CborMap";
import CborUInt from "../../../cbor/CborObj/CborUInt";
import { canBeUInteger, forceUInteger } from "../../../types/ints/Integer";
import ObjectUtils from "../../../utils/ObjectUtils";
import GenesisHash from "../../hashes/Hash28/GenesisHash";
import Epoch from "../Epoch";
import ProtocolParamters, { isPartialProtocolParameters, partialProtocolParametersToCborObj } from "./ProtocolParameters";

export type ProtocolUpdateProposal = [ ProtocolParametersUpdateMap, Epoch ];

export default ProtocolUpdateProposal;

export type ProtocolParametersUpdateMap = {
    genesisHash: GenesisHash
    changes: Partial<ProtocolParamters>
}[];

export function isProtocolParametersUpdateMap( something: object ): something is ProtocolParametersUpdateMap
{
    return (
        Array.isArray( something ) &&
        something.every( entry => {
            return (
                ObjectUtils.isObject( entry ) &&
                entry.genesisHash instanceof GenesisHash &&
                isPartialProtocolParameters( entry.changes )
            )
        })
    );
}

export function isProtocolUpdateProposal( something: object ): something is ProtocolUpdateProposal
{
    return (
        Array.isArray( something ) &&
        something.length >= 2 &&
        isProtocolParametersUpdateMap( something[0] ) &&
        canBeUInteger( something[1] )
    );
}

export function protocolParametersUpdateMapToCborObj( ppUpdate: ProtocolParametersUpdateMap ): CborMap
{
    return new CborMap(
        ppUpdate.map( entry => {
            return {
                k: entry.genesisHash.toCborObj(),
                v: partialProtocolParametersToCborObj( entry.changes )
            }
        })
    )
}

export function protocolUpdateProposalToCborObj( protocolUpdate: ProtocolUpdateProposal ): CborObj
{
    return new CborArray([
        protocolParametersUpdateMapToCborObj( protocolUpdate[0] ),
        new CborUInt( forceUInteger( protocolUpdate[1] ).asBigInt )
    ])
}