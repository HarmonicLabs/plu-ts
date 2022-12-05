import ByteString from "../../../types/HexString/ByteString";
import JsRuntime from "../../../utils/JsRuntime";

export default class Hash28 extends ByteString
{
    constructor( bs: string | Buffer | Hash28 , className: string = "Hash28" )
    {
        super( bs instanceof Hash28 ? bs.asBytes : bs );

        JsRuntime.assert(
            this._bytes.length === 28,
            "'" + className + "' must be an hash of length 28"
        );
    }

    valueOf(): string
    {
        return this.asString;
    }
}