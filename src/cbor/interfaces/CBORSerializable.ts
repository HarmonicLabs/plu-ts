import CborObj from "../CborObj";
import type CborString from "../CborString";

export default interface CBORSerializable 
{
    toCBOR: () => CborString
}

export interface ToCbor
{
    toCborObj: () => CborObj
    toCbor: () => CborString
}

export interface FromCbor<T>
{
    new (...args: any[]): T
    fromCbor( cbor: CborString ): T,
    fromCborObj( cbor: CborObj ): T
}