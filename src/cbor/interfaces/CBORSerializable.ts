import CborObj from "../CborObj";
import type CborString from "../CborString";

export default interface CBORSerializable 
{
    toCBOR: () => CborString
}

export interface ToCborObj {
    toCborObj: () => CborObj
}

export interface ToCborString {
    toCbor: () => CborString
}

export interface ToCbor extends ToCborObj, ToCborString {}

export interface FromCbor<T>
{
    fromCbor( cbor: CborString ): T,
    fromCborObj( cbor: CborObj ): T
}