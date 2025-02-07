
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