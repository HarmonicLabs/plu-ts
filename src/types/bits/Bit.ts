import Debug from "../../utils/Debug";
import JsRuntime from "../../utils/JsRuntime";

export type RawBit = 0 | 1;

export type InByteOffset = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export function isInByteOffset( offset: InByteOffset ): boolean
{
    return (  
        offset === 0 ||
        offset === 1 ||
        offset === 2 ||
        offset === 3 ||
        offset === 4 ||
        offset === 5 ||
        offset === 6 ||
        offset === 7
    );
}

export function forceInByteOffset( offset: number ): InByteOffset
{
    return (Math.round( Math.abs( offset ) ) % 8) as InByteOffset;
}

export default class Bit
{
    private _bit: RawBit;

    constructor( bit: RawBit | boolean )
    {
        JsRuntime.assert(
            bit === 0 || bit === 1 || bit === false || bit === true,
            "invalid Bit value passed, expecte boolean or either 0 or 1, got: ", new Debug.AddInfos({
                input: bit
            })
        );
        this._bit = typeof bit === "boolean" ? ( bit ? 1 : 0) : bit;
    }
    
    asNumber() : RawBit
    {
        return this._bit;
    }

    asBoolean() : boolean
    {
        return this._bit === 1;
    }
}