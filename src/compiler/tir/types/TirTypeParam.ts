
export class TirTypeParam
{
    constructor(
        readonly name: string,
        readonly symbol: symbol = Symbol( this.name )
    ) {}

    toString(): string
    {
        return this.name;
    }

    toInternalName(): string
    {
        return this.toString();
    }
    
    isConcrete(): boolean { return false; }
    
    clone(): TirTypeParam
    {
        return new TirTypeParam(this.name, this.symbol);
    }

    eq( other: TirTypeParam ): boolean
    {
        return this.symbol === other.symbol;
    }

    static eq( a: TirTypeParam, b: TirTypeParam ): boolean
    {
        return a.symbol === b.symbol
    }
}