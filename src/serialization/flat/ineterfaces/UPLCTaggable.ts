import { BitOffset } from "../../../types/bits/Bit"
import BitStream from "../../../types/bits/BitStream"


export default interface UPLCTaggable
{
    getUPLCTag : ( startOffset?: BitOffset ) => BitStream
}