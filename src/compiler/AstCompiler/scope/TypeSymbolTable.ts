import { Scope } from "./Scope";
import { PebbleAnyTypeSym } from "./symbols/PebbleSym";

export class TypeSymbolTable
{
    readonly symbols = new Map<string, PebbleAnyTypeSym>();
    constructor(
        readonly scope: Scope,
    ) {}

    clone(): TypeSymbolTable
    {
        const cloned = new TypeSymbolTable(
            this.scope,
        );
        for (const [name, sym] of this.symbols)
        {
            cloned.symbols.set( name, sym );
        }
        return cloned;
    }

    /**
     * @returns `true` if the symbol was defined successfully
     * @returns `false` if the symbol was already defined
     */
    define( sym: PebbleAnyTypeSym ): boolean
    {
        if( this.isDefined( sym.name ) ) return false;
        this.symbols.set( sym.name, sym );
        return true;
    }

    // // to check for re-declarations
    // isDefinedInThisScope( name: string ): boolean
    // {
    //     return this.symbols.has( name ); // || this.parent?.isDefined( name );
    // }

    // to check for re-declarations
    isDefined( name: string ): boolean
    {
        return this.resolve( name ) !== undefined;
    }

    resolve( name: string ): PebbleAnyTypeSym | undefined
    {
        return this.symbols.get( name ) ?? this.scope.parent?.resolveType( name );
    }
}