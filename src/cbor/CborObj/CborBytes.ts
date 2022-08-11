import BufferUtils from "../../utils/BufferUtils";
import JsRuntime from "../../utils/JsRuntime";
import ToRawObj from "./interfaces/ToRawObj";

export type RawCborBytes = {
    bytes: Buffer
}

export default class CborBytes
    implements ToRawObj
{
    private _buff : Buffer;
    get buffer(): Buffer { return BufferUtils.copy( this._buff ) }
    
    constructor( bytes: Buffer )
    {
        JsRuntime.assert(
            Buffer.isBuffer(bytes),
            "invalid buffer in CborBytes"
        );

        this._buff = bytes;
    }

    toRawObj(): RawCborBytes
    {
        return {
            bytes: this.buffer
        };
    }
}
