import type CborString from "../CborString";

export default interface CBORSerializable 
{
    toCBOR: () => CborString
}