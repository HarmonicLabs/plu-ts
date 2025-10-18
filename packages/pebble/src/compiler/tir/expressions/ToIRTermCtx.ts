import { IRVar } from "../../../IR/IRNodes/IRVar";
import { IRSelfCall } from "../../../IR/IRNodes/IRSelfCall";

const _1n = BigInt(1);

export class ToIRTermCtx
{
    private readonly localVars: Map<string, symbol> = new Map();

    private _firstVariableIsRecursive: boolean = false;

    constructor(
        readonly parent: ToIRTermCtx | undefined,
        /**
         * quick access from a variable name to its context
         * used to resolve the variables in 0(1) time
         */
        private readonly variableToCtx: Map<string, ToIRTermCtx>
    ) {
        this.localVars = new Map();

        // DO NOT SET _parentDbn HERE
        // it must be a getter to reflect changes in parent
        // (parent dbn can change)
        this._firstVariableIsRecursive = false;
    }

    allVariables(): string[] {
        return (
            (this.parent?.allVariables() ?? [])
            .concat([ ...this.localVars.keys() ])
        );
    }

    static root(): ToIRTermCtx {
        return new ToIRTermCtx( undefined, new Map() );
    }

    newChild(): ToIRTermCtx {
        return new ToIRTermCtx( this, this.variableToCtx );
    }

    private localVarSym( name: string ): symbol | undefined {
        return this.localVars.get( name );
    }

    getVarAccessSym( name: string ): symbol | undefined {
        const ctx = this.variableToCtx.get( name );
        if( !ctx ) return undefined;
        return ctx.localVarSym( name );
    }

    getVarAccessIR( name: string ): IRVar | IRSelfCall | undefined {
        const accessSym = this.getVarAccessSym( name );
        if( typeof accessSym !== "symbol" ) return undefined;

        if(
            this._firstVariableIsRecursive
            && name === this.localVars.keys().next().value
        ) return new IRSelfCall( accessSym );
        
        return new IRVar( accessSym );
    }

    /**
     * @returns the symbol of the defined variable (for eventual `new IRFunc( ... )`)
    **/
    defineVar( varName: string | symbol ): symbol
    {
        const name = typeof varName === "string" ? varName : varName.description!;

        const exsistingCtx = this.variableToCtx.get( name );
        if(
            exsistingCtx
            && exsistingCtx.localVarSym( name ) !== undefined
        ) throw new Error(`variable '${name}' already defined in the current scope`);

        const sym = typeof varName === "string" ? Symbol( name ) : varName;
        this.localVars.set( name, sym );
        this.variableToCtx.set( name, this );
        return sym;
    }
    /**
     * @returns the symbol of the defined recursive variable (for eventual `new IRRecursive( ... )`)
    **/
    defineRecursiveVar( name: string ): symbol
    {
        if(
            this.localVars.size > 0
            || this._firstVariableIsRecursive
        ) throw new Error("recursive variable must be the first defined variable in the context");
        
        this._firstVariableIsRecursive = true;
        return this.defineVar( name );
    }

    private _parentDbn: number | undefined = undefined;
    get dbn(): number {
        if( typeof this._parentDbn !== "number" ) this._parentDbn = this.parent instanceof ToIRTermCtx ? this.parent.dbn : 0;
        return this.localVars.size + this._parentDbn;
    }

    pushUnusedVar( postfix?: string ): symbol {
        // this.variables.push( "" );
        // just to increment dbn

        // we need a new unique name in the `variables` map
        // (if we just use empty string, or the same string, it will overwrite the previous "unused" entry)
        // 
        // we start with the number so we know it is not a valid variable name
        // but we add "_unused" so the key is not an integer (which would be sorted first in Object.keys)
        const prefix = this.dbn.toString();
        if(!(
            typeof postfix === "string"
            && postfix.length > 0
        )) postfix = "unused";
        const name = prefix + "_" + postfix;

        const sym = Symbol( name );
        this.localVars.set( name, sym );
        return sym;
    }
}