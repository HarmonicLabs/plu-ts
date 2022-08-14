import JsRuntime from "../../utils/JsRuntime";
import ToRawObj from "./interfaces/ToRawObj";

export type RawCborUInt = {
    uint: bigint
}

export function isRawCborUnsigned( unsign: RawCborUInt ): boolean
{
    if( typeof unsign !== "object" ) return false;
    
    const keys = Object.keys( unsign );

    return (
        keys.length === 1 &&
        keys[0] === "uint"  &&
        typeof unsign.uint === "bigint" &&
        unsign.uint >= 0
    );
}

export default class CborUInt
    implements ToRawObj
{
    private _unsigned : bigint;
    get num(): bigint { return this._unsigned }
    
    constructor( uint: number | bigint )
    {
        if( typeof uint === "number" )
        {
            uint = BigInt( uint );
        }

        JsRuntime.assert(
            typeof uint === "bigint" &&
            uint >= BigInt( 0 ),
            "uint CBOR numbers must be greater or equal 0; got: " + uint
        );

        this._unsigned = uint;
    }

    toRawObj(): RawCborUInt
    {
        return {
            uint: this.num
        };
    }
}