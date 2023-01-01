import JsRuntime from "../../../utils/JsRuntime";
import Hash from "../Hash";

export default class Hash32 extends Hash
{
    constructor( bs: string | Buffer | Hash32 , className: string = "Hash32" )
    {
        super( bs instanceof Hash32 ? bs.asBytes : bs );

        JsRuntime.assert(
            this._bytes.length === 32,
            "'" + className + "' must be an hash of length 32"
        );
    }
    
}