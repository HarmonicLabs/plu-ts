import { PEBBLE_INTERNAL_IDENTIFIER_PREFIX, PEBBLE_INTERNAL_IDENTIFIER_SEPARATOR } from "../../internalVar";
import { TirType } from "../../tir/types/TirType";
import { getStructType } from "../../tir/types/type-check-utils/canAssignTo";
import { IPebbleConcreteTypeSym, IPebbleGenericSym, IPebbleSym, PebbleAnyTypeSym, PebbleConcreteFunctionSym, PebbleConcreteTypeSym, PebbleGenericFunctionSym, PebbleGenericSym, PebbleSym, PebbleValueSym } from "./symbols/PebbleSym";
import { TypeSymbolTable } from "./TypeSymbolTable";
import { ValueSymbolTable } from "./ValueSymbolTable";

export interface ScopeInfos {
    isFunctionDeclScope: boolean;
}

const invalidSymbolNames = new Set([
    "this"
]);

export function getAppliedTypeInternalName(
    genericName: string,
    args: string[]
): string
{
    return (
        PEBBLE_INTERNAL_IDENTIFIER_PREFIX + 
        genericName + 
        PEBBLE_INTERNAL_IDENTIFIER_SEPARATOR +
        args.join("_")
    );
}

export interface IAvaiableConstructor {
    declaredName: string;
    originalName: string;
    structSym: PebbleConcreteTypeSym;
}

export class Scope
{
    readonly parent: Scope | undefined;
    readonly valueSymbols: ValueSymbolTable;
    readonly typeSymbols : TypeSymbolTable | undefined;
    readonly aviableConstructors: Map<string, IAvaiableConstructor> = new Map();

    private _isReadonly = false;

    constructor(
        parent: Scope | undefined,
        readonly infos: ScopeInfos,
        valueSymbols?: ValueSymbolTable,
        typeSymbols ?: TypeSymbolTable
    ) {
        this._isReadonly = false;

        this.parent = parent;
        this.valueSymbols = valueSymbols instanceof ValueSymbolTable ?
            valueSymbols :
            new ValueSymbolTable( this );
        (this.valueSymbols as any).scope = this;

        this.typeSymbols  = typeSymbols  ?? undefined;
        if(
            this.typeSymbols instanceof TypeSymbolTable
        ) {
            (this.typeSymbols  as any).scope = this;
        }
    }

    readonly(): void { this._isReadonly = true; }

    newChildScope( infos: ScopeInfos ): Scope
    {
        return new Scope( this, infos );
    }

    /**
     * @returns `true` if the constructor was defined successfully
     * 
     * @returns `false`
     *      if it was already defined in this scope (shadows any similar definitions in parent scopes),
     *      or if the type symbol is not assignable to a struct,
     *      or if it is a struct but is not concrete
     */
    defineAviableConstructorIfValid(
        declaredName: string,
        originalName: string,
        structSym: PebbleConcreteTypeSym,
        // genericTypeSymbol: PebbleGenericSym | undefined
    ): boolean
    {
        const structType = getStructType( structSym.concreteType );
        if( !structType || !structType.isConcrete() )
            return false; // not a concrete struct

        if( this.aviableConstructors.has( declaredName ) ) return false; // already defined

        this.aviableConstructors.set( declaredName, {
            declaredName,
            originalName,
            structSym
        });
        return true;
    }
    inferStructTypeFromConstructorName( name: string ): IAvaiableConstructor | undefined
    {
        return (
            this.aviableConstructors.get( name )
            ?? this.parent?.inferStructTypeFromConstructorName( name )
        );
    }

    symFromConcreteType( sym: TirType ): PebbleConcreteTypeSym
    {
        const resolveInternalNameResult = this.resolveType( sym.toInternalName() );
        
        if( resolveInternalNameResult instanceof PebbleConcreteTypeSym )
            return resolveInternalNameResult;
        if( resolveInternalNameResult !== undefined )
            throw new Error("unexpected symbol: " + sym.toInternalName());

        const concreteSym = new PebbleConcreteTypeSym({
            name: sym.toInternalName(),
            concreteType: sym
        });
        this.defineConcreteType( concreteSym );
        return concreteSym;
    }

    getThisType(): TirType | undefined
    {
        const sym = this.resolveType( "this" );
        if(!(
            sym
            && sym instanceof PebbleConcreteTypeSym
            && sym.concreteType.isConcrete()
        )) return undefined;
        return sym.concreteType;
    }

    getAppliedGenericType(
        genericName: string,
        args: string[],
    ): PebbleConcreteTypeSym | undefined
    {
        const expectedName = getAppliedTypeInternalName( genericName, args );
        
        const result = this.resolveType( expectedName );
        if( result instanceof PebbleConcreteTypeSym )
            return result;
        if( result !== undefined )
            throw new Error("unexpected symbol: " + expectedName);
        
        return this._getAppliedGenericType( genericName, args, undefined, expectedName );
    }
    private _getAppliedGenericType(
        genericName: string | PebbleGenericSym,
        args: (string | PebbleConcreteTypeSym)[],
        lowestFullyDefinedScope: Scope | undefined,
        expectedName: string
    ): PebbleConcreteTypeSym | undefined
    {
        if(!( this.typeSymbols instanceof TypeSymbolTable ))
        {
            return this.parent?._getAppliedGenericType(
                genericName,
                args,
                lowestFullyDefinedScope,
                expectedName
            );
        }

        const nextArgs = args.map( arg => {
            if( arg instanceof PebbleConcreteTypeSym )
                return arg;
            const resolved = this.typeSymbols?.symbols.get( arg );
            if( resolved instanceof PebbleConcreteTypeSym )
                return resolved;
            if( resolved !== undefined )
                throw new Error("unexpected symbol: " + arg);
            return arg;
        });

        lowestFullyDefinedScope = lowestFullyDefinedScope ?? (
            nextArgs.some( arg => arg instanceof PebbleConcreteTypeSym ) ?
                this :
                undefined
        );

        const genericNameWasString = typeof genericName === "string";
        const nextGenericName = genericNameWasString ?
            this.typeSymbols.resolve( genericName ) :
            genericName;

        const genericSymIsHere = nextGenericName instanceof PebbleGenericSym;
        if(
            genericNameWasString
            && genericSymIsHere
            && !(lowestFullyDefinedScope instanceof Scope)
        ) lowestFullyDefinedScope = this;

        if(
            genericSymIsHere
            && nextArgs.every( arg => arg instanceof PebbleConcreteTypeSym )
        ) {
            const applied = applyGenericType(
                nextGenericName,
                nextArgs as PebbleConcreteTypeSym[]
            );
            
            if( applied === undefined ) return undefined;

            const appliedSym = new PebbleConcreteTypeSym({
                name: expectedName,
                concreteType: applied,
            });

            // define name so that it can be resolved in the future
            if( lowestFullyDefinedScope instanceof Scope )
                lowestFullyDefinedScope.defineConcreteType( appliedSym );
            else throw new Error(
                "unexpected lowestFullyDefinedScope undefined, "+
                "but full type is defined"
            );

            return appliedSym;
        }

        if( !this.parent ) return undefined;
        if(!(
            genericSymIsHere
            || typeof nextGenericName === "string"
        )) throw new Error("unexpected next generic type symbol");

        return this.parent._getAppliedGenericType(
            nextGenericName,
            nextArgs,
            lowestFullyDefinedScope,
            expectedName
        );
    }

    clone(): Scope
    {
        const cloned = new Scope(
            this.parent?.clone(),
            { ...this.infos },
            this.valueSymbols.clone(),
            this.typeSymbols?.clone()
        );
        return cloned;
    }

    defineValue( sym: PebbleValueSym ): boolean
    {
        if( this._isReadonly ) return false;
        if( invalidSymbolNames.has( sym.name ) )
            return false;
        return this.valueSymbols.define( sym );
    }
    /**
     * @returns `true` if the symbol was defined successfully
     * @returns `false` if the symbol was already defined
     */
    defineType( sym: PebbleAnyTypeSym ): boolean
    {
        if( this._isReadonly ) return false;
        if( invalidSymbolNames.has( sym.name ) )
            return false;

        if( sym instanceof PebbleConcreteTypeSym )
            return this.defineConcreteType( sym );

        if( sym instanceof PebbleGenericSym )
            return this.defineGenericType( sym );

        if( sym instanceof PebbleConcreteFunctionSym )
            return this.defineConcreteFuncType( sym );

        if( sym instanceof PebbleGenericFunctionSym )
            return this.defineGenericFuncType( sym );

        throw new Error("unknown type symbol");
    }
    defineConcreteType( sym: IPebbleConcreteTypeSym ): boolean
    {
        if( this._isReadonly ) return false;
        if( invalidSymbolNames.has( sym.name ) )
            return false;
        
        if(!( this.typeSymbols instanceof TypeSymbolTable ))
        {
            (this as any).typeSymbols = new TypeSymbolTable( this );
        }
        return this.typeSymbols!.define(
            sym instanceof PebbleConcreteTypeSym ? sym : new PebbleConcreteTypeSym( sym )
        );
    }
    defineGenericType( sym: IPebbleGenericSym ): boolean
    {
        if( this._isReadonly ) return false;
        if( invalidSymbolNames.has( sym.name ) )
            return false;

        if(!( this.typeSymbols instanceof TypeSymbolTable ))
        {
            (this as any).typeSymbols = new TypeSymbolTable( this );
        }
        return this.typeSymbols!.define(
            sym instanceof PebbleGenericSym ? sym : new PebbleGenericSym( sym )
        );
    }
    defineConcreteFuncType( sym: PebbleConcreteFunctionSym ): boolean
    {
        if( this._isReadonly ) return false;
        if( invalidSymbolNames.has( sym.name ) )
            return false;

        if(!( this.typeSymbols instanceof TypeSymbolTable ))
        {
            (this as any).typeSymbols = new TypeSymbolTable( this );
        }
        return this.typeSymbols!.define(
            sym instanceof PebbleConcreteFunctionSym ? sym : new PebbleConcreteFunctionSym( sym )
        );
    }
    defineGenericFuncType( sym: PebbleGenericFunctionSym ): boolean
    {
        if( this._isReadonly ) return false;
        if( invalidSymbolNames.has( sym.name ) )
            return false;

        if(!( this.typeSymbols instanceof TypeSymbolTable ))
        {
            (this as any).typeSymbols = new TypeSymbolTable( this );
        }
        return this.typeSymbols!.define(
            sym instanceof PebbleGenericFunctionSym ? sym : new PebbleGenericFunctionSym( sym )
        );
    }

    resolveValue( name: string ): [
        symbol:  PebbleValueSym,
        isDefinedOutsideFuncScope: boolean
    ] | undefined
    {
        return this.valueSymbols.resolve( name );
    }
    resolveType( name: string ): PebbleAnyTypeSym | undefined
    {
        if( this.typeSymbols instanceof TypeSymbolTable )
            return this.typeSymbols.resolve( name );
        else return this.parent?.resolveType( name );
    }

    isDefined( name: string ): boolean
    {
        return (
            this.valueSymbols.isDefined( name ) ||
            (this.typeSymbols?.isDefined( name ) ?? false)
        );
    }
}

function applyGenericType( 
    genericSym: PebbleGenericSym,
    argsSyms: PebbleConcreteTypeSym[]
): TirType | undefined
{
    if( argsSyms.length !== genericSym.nTypeParameters )
        return undefined;

    const args = argsSyms.map( arg => arg.concreteType );
    return genericSym.getConcreteType( ...args );
}