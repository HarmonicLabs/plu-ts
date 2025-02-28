
export class TirTypeParam
{
    constructor(
        readonly symbol: symbol
    ) {}

    toString(): string
    {
        return `TypeParam(${this.symbol.toString()})`;
    }
    
    isConcrete(): boolean { return false; }
    
    clone(): TirTypeParam
    {
        return new TirTypeParam(this.symbol);
    }
}