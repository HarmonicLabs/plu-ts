
export class TirTypeParam
{
    readonly symbol: symbol;
    constructor(
        readonly name: string,
        symbol?: symbol
    ) {
        this.name = name;
        if( typeof symbol !== "symbol" ) this.symbol = Symbol(name);
    }

    hasDataEncoding(): boolean { return false; }

    toTirTypeKey(): string {
        throw new Error("`toTirTypeKey` called on TirTypeParam; tir cannot have ambiguous types");
    }
    toConcreteTirTypeName(): string {
        throw new Error("`toConcreteTirTypeName` called on TirTypeParam; tir cannot have ambiguous types");
    }

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