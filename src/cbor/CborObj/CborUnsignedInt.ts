import JsRuntime from "../../utils/JsRuntime";
import ToRawObj from "./interfaces/ToRawObj";

export type RawCborUnsignedInt = {
    unsigned: bigint
}

export default class CborUnsignedInt
    implements ToRawObj
{
    private _unsigned : bigint;
    get num(): bigint { return this._unsigned }
    
    constructor( unsigned: number | bigint )
    {
        if( typeof unsigned === "number" )
        {
            unsigned = BigInt( unsigned );
        }

        JsRuntime.assert(
            typeof unsigned === "bigint" &&
            unsigned >= BigInt( 0 ),
            "unsigned CBOR numbers must be greater or equal 0; got: " + unsigned
        );

        this._unsigned = unsigned;
    }

    toRawObj(): RawCborUnsignedInt
    {
        return {
            unsigned: this.num
        };
    }
}