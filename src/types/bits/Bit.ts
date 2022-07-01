
export type RawBit = 0 | 1;

export type BitOffset = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export function isBitOffset( offset: BitOffset ): boolean
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

export default class Bit
{
    private _bit: RawBit;

    constructor( bit: RawBit | boolean )
    {
        bit = typeof bit === "boolean" ? ( bit ? 1 : 0) : bit;
        // think in javascript
        bit = bit == 0 ? 0 : 1;
        
        this._bit = bit;
    }
    
    get() : RawBit
    {
        return this._bit;
    }
}