import { IPebbleSym, PebbleSym } from "./symbols/PebbleSym";

export class Scope
{
    constructor(
        readonly parent: Scope | undefined,
        valueSymbols?: SymbolTable,
        typeSymbols ?: SymbolTable
    ) {
        this.valueSymbols = valueSymbols ?? new SymbolTable( this, this.parent?.valueSymbols );
        this.typeSymbols  = typeSymbols  ?? new SymbolTable( this, this.parent?.typeSymbols  );
        (this.valueSymbols as any).scope = this;
        (this.typeSymbols  as any).scope = this;
        (this.valueSymbols as any).parentTable = this.parent?.valueSymbols;
        (this.typeSymbols  as any).parentTable = this.parent?.typeSymbols;
    }

    clone(): Scope
    {
        const cloned = new Scope(
            this.parent?.clone(),
            this.valueSymbols.clone(),
            this.typeSymbols.clone()
        );
        return cloned;
    }

    readonly valueSymbols: SymbolTable;
    readonly typeSymbols : SymbolTable;
    
    defineValue( sym: PebbleSym & IPebbleSym ): void
    {
        this.valueSymbols.define( sym );
    }
    defineType( sym: PebbleSym & IPebbleSym ): void
    {
        this.typeSymbols.define( sym );
    }

    resolveValue( name: string ): IPebbleSym | undefined
    {
        return this.valueSymbols.resolve( name );
    }
    resolveType( name: string ): IPebbleSym | undefined
    {
        return this.typeSymbols.resolve( name );
    }

    // to check for re-declarations
    isValueDefinedInThisScope( name: string ): boolean
    {
        return this.valueSymbols.isDefinedInThisScope( name );
    }
    isTypeDefinedInThisScope( name: string ): boolean
    {
        return this.typeSymbols.isDefinedInThisScope( name );
    }
}

export class SymbolTable
{
    private readonly symbols = new Map<string, IPebbleSym>();
    constructor(
        readonly scope: Scope,
        readonly parentTable: SymbolTable | undefined,
        // readonly name: string | undefined = undefined,
    ) {}

    clone(): SymbolTable
    {
        const cloned = new SymbolTable(
            this.scope,
            this.parentTable?.clone(),
            // this.name
        );
        for (const [name, sym] of this.symbols)
        {
            cloned.symbols.set( name, sym );
        }
        return cloned;
    }

    define( sym: PebbleSym & IPebbleSym ): void
    {
        this.symbols.set( sym.name, sym );
    }

    // to check for re-declarations
    isDefinedInThisScope( name: string ): boolean
    {
        return this.symbols.has( name ); // || this.parent?.isDefined( name );
    }

    resolve( name: string ): IPebbleSym | undefined
    {
        return this.symbols.get( name ) ?? this.parentTable?.resolve( name );
    }

}