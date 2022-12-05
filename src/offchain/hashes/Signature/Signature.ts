import ByteString from "../../../types/HexString/ByteString";
import JsRuntime from "../../../utils/JsRuntime";

export default class Signature extends ByteString
{
    constructor( bs: string | Buffer | Signature , className: string = "Signature" )
    {
        super( bs instanceof Signature ? bs.asBytes : bs );

        JsRuntime.assert(
            this._bytes.length === 64,
            "'" + className + "' must be an hash of length 32"
        );
    }

    valueOf(): string
    {
        return this.asString;
    }
}