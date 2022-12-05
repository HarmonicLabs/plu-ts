import ByteString from "../../../types/HexString/ByteString";
import JsRuntime from "../../../utils/JsRuntime";

export default class Hash32 extends ByteString
{
    constructor( bs: string | Buffer | Hash32 , className: string = "Hash32" )
    {
        super( bs instanceof Hash32 ? bs.asBytes : bs );

        JsRuntime.assert(
            this._bytes.length === 32,
            "'" + className + "' must be an hash of length 32"
        );
    }

    valueOf(): string
    {
        return this.asString;
    }
}