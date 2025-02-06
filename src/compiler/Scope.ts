
export interface SymbolInfos {
    /** `true` if the symbol indicates a type */
    isTypeSymbol: boolean;
    /**
     * if `isTypeSymbol` is `true`,
     * this is the definition of the type.
     * 
     * if `isTypeSymbol` is `false`,
     * this is the type of the symbol.
     */
    type: any;
}

export class Scope
{
    private readonly symbols = new Map<string, SymbolInfos>();
    constructor(
        readonly parent: Scope | undefined,
        // readonly name: string | undefined = undefined,
    ) {}

    define( name: string, infos: SymbolInfos ): void
    {
        this.symbols.set( name, infos );
    }

    // to check for re-declarations
    isDefinedInThisScope( name: string ): boolean
    {
        return this.symbols.has( name ); // || this.parent?.isDefined( name );
    }

    resolve( name: string ): SymbolInfos | undefined
    {
        return this.symbols.get( name ) ?? this.parent?.resolve( name );
    }

}