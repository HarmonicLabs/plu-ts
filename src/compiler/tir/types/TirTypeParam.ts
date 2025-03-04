
export class TirTypeParam
{
    constructor(
        readonly symbol: symbol = Symbol()
    ) {}

    toString(): string
    {
        return `TypeParam(${this.symbol.toString()})`;
    }

    toInternalName(): string
    {
        return this.toString();
    }
    
    isConcrete(): boolean { return false; }
    
    clone(): TirTypeParam
    {
        return new TirTypeParam(this.symbol);
    }
}