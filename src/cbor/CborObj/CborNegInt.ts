import JsRuntime from "../../utils/JsRuntime";
import ToRawObj from "./interfaces/ToRawObj";

export type RawCborNegInt = {
    neg: bigint
}

export function isRawCborNegative( neg: RawCborNegInt ): boolean
{
    if( typeof neg !== "object" ) return false;
    
    const keys = Object.keys( neg );

    return (
        keys.length === 1 &&
        keys[0] === "neg"  &&
        typeof neg.neg === "bigint" &&
        neg.neg < 0
    );
}

export default class CborNegInt
    implements ToRawObj
{
    private _neg : bigint;
    get num(): bigint { return this._neg }
    
    constructor( neg: number | bigint )
    {
        if( typeof neg === "number" )
        {
            neg = BigInt( neg );
        }

        JsRuntime.assert(
            typeof neg === "bigint" &&
            neg < BigInt( 0 ),
            "neg CBOR numbers must be less than 0; got: " + neg
        );

        this._neg = neg;
    }

    toRawObj(): RawCborNegInt
    {
        return {
            neg: this.num
        };
    }
}