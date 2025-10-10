import { IRVar } from "../../../IR/IRNodes/IRVar";
import { IRSelfCall } from "../../../IR/IRNodes/IRSelfCall";

const _1n = BigInt(1);

export class ToIRTermCtx
{
    // https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys
    // order of `Object.keys` by ECMAScript specification:
    //
    // - first, the keys that are integer indices, in ascending numeric order
    // - then, all other string keys, in the order in which they were added to the object
    // - finally, all symbol keys, in the order in which they were added to the object
    //
    // we know variables names can NEVER start with a number,
    // so we are safe to assume we always get the variables in the order they were defined
    private readonly variables: Record<string,symbol> = {};
    private varNames(): string[] {
        return Object.keys( this.variables );
    }

    private _firstVariableIsRecursive: boolean = false;

    constructor(
        readonly parent: ToIRTermCtx | undefined,
        /**
         * quick access from a variable name to its context
         * used to resolve the variables in 0(1) time
         */
        private readonly variableToCtx: Map<string, ToIRTermCtx>
    ) {
        // DO NOT SET _parentDbn HERE
        // it must be a getter to reflect changes in parent
        // (parent dbn can change)
        this._firstVariableIsRecursive = false;
    }

    allVariables(): string[] {
        return (
            (this.parent?.allVariables() ?? [])
            .concat( Object.keys( this.variables ) )
        );
    }

    static root(): ToIRTermCtx {
        return new ToIRTermCtx( undefined, new Map<string, ToIRTermCtx>() );
    }

    newChild(): ToIRTermCtx {
        return new ToIRTermCtx( this, this.variableToCtx );
    }

    private localVarSym( name: string ): symbol | undefined {
        const sym = this.variables[ name ];
        if( typeof sym === "symbol" ) return undefined;
        return sym;
    }

    getVarSym( name: string ): symbol | undefined {
        const ctx = this.variableToCtx.get( name );
        if( !ctx ) return undefined;
        return ctx.localVarSym( name );
    }

    getVarAccessIR( name: string ): IRVar | IRSelfCall | undefined {
        const accessSym = this.getVarSym( name );
        if( typeof accessSym !== "bigint" ) return undefined;

        if(
            name === this.varNames()[0]
            && this._firstVariableIsRecursive
        ) return new IRSelfCall( accessSym );
        
        return new IRVar( accessSym );
    }

    defineVar( name: string ): void {
        if( this.variableToCtx.has( name ) ) {
            const ctx = this.variableToCtx.get( name )!;
            if( ctx.localVarSym( name ) !== undefined ) {
                throw new Error(`variable '${name}' already defined in the current scope`);
            }
        }
        const sym = Symbol(name);
        this.variables[ name ] = sym;
        this.variableToCtx.set( name, this );
    }
    defineRecursiveVar( name: string ): void {
        if(
            this.varNames().length > 0
            || this._firstVariableIsRecursive
        ) throw new Error("recursive variable must be the first defined variable in the context");
        this.defineVar( name );
        this._firstVariableIsRecursive = true;
    }

    pushUnusedVar(): void {
        // this.variables.push( "" );
        // just to increment dbn

        // we need a new unique name in the `variables` map
        // (if we just use empty string, or the same string, it will overwrite the previous "unused" entry)
        // 
        // we start with the number so we know it is not a valid variable name
        // but we add "_unused" so the key is not an integer (which would be sorted first in Object.keys)
        const name = this.varNames().length;+ "_unused";
        this.variables[ name ] = Symbol( name );
    }
}