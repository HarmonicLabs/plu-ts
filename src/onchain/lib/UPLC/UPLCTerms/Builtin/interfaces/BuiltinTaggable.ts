import BitStream from "../../../../../../types/bits/BitStream";
import UPLCBuiltinTag from "../UPLCBuiltinTag";

export default interface BuiltinTaggable
{
    getBuiltinTag: () => UPLCBuiltinTag
    getBuiltinTagBitStream: () => BitStream
}