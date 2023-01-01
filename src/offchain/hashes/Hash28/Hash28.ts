import JsRuntime from "../../../utils/JsRuntime";
import Hash from "../Hash";

export default class Hash28 extends Hash
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

    clone(): Hash28
    {
        return new Hash28( this.asBytes );
    }
}