import JsRuntime from "../../../utils/JsRuntime";
import Hash from "../Hash";

export default class Signature extends Hash
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