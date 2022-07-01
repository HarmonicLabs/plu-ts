import { BitOffset } from "../../../types/bits/Bit";
import BitStream from "../../../types/bits/BitStream";
import UPLCScript from "../UPLCScript";

export default interface UPLCSerializable 
{
    toUPLCBitStream: ( startOffset?: BitOffset ) => BitStream
}