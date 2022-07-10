import BitStream from "../../../types/bits/BitStream";

export default interface UPLCSerializable 
{
    toUPLCBitStream: () => BitStream
}