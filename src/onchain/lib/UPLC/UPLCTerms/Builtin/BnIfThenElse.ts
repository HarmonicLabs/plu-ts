import UPLCSerializable from "../../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../../../types/bits/BitStream";
import { UPLCBool } from "../../UPLCPrimitive/UPLCBool";
import BuiltinTaggable from "./interfaces/BuiltinTaggable";
import UPLCBuiltinTag, { UPLCBuiltinTagToBitStream } from "./UPLCBuiltinTag";


export class BnIfThenElse<ResultTermT extends UPLCSerializable>
implements BuiltinTaggable, UPLCSerializable
{
    constructor( condition: UPLCBool, caseTrue: ResultTermT, caseFalse: ResultTermT )
    {
        
    }

    getBuiltinTag() : UPLCBuiltinTag
    {
        return UPLCBuiltinTag.ifThenElse;
    }

    getBuiltinTagBitStream(): BitStream
    {
        return UPLCBuiltinTagToBitStream( 
            this.getBuiltinTag()
        );
    }

    toUPLCBitStream(): BitStream
    {

    }
}