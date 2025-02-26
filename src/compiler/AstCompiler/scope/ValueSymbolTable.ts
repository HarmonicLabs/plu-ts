import { Scope } from "./Scope";
import { PebbleValueSym } from "./symbols/PebbleSym";

export class ValueSymbolTable
{
    readonly symbols = new Map<string, PebbleValueSym>();
    constructor(
        readonly scope: Scope,
    ) {}

    clone(): ValueSymbolTable
    {
        const cloned = new ValueSymbolTable(
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
    define( sym: PebbleValueSym ): boolean
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

    resolve( name: string ): PebbleValueSym | undefined
    {
        return this.symbols.get( name ) ?? this.scope.parent?.valueSymbols.resolve( name );
    }

}