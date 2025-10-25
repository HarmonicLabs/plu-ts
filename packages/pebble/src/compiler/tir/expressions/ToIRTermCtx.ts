import { IRVar } from "../../../IR/IRNodes/IRVar";
import { IRSelfCall } from "../../../IR/IRNodes/IRSelfCall";

const _1n = BigInt(1);

export class ToIRTermCtx
{
    readonly _creationStack?: string | undefined;
    private readonly localVars: Map<string, symbol> = new Map();

    private _firstVariableIsRecursive: boolean = false;

    _children: ToIRTermCtx[] = [];

    constructor(
        readonly parent: ToIRTermCtx | undefined,
    ) {
        this.parent?._children.push( this );

        this._creationStack = new Error().stack;
        this.localVars = new Map();

        // DO NOT SET _parentDbn HERE
        // it must be a getter to reflect changes in parent
        // (parent dbn can change)
        this._firstVariableIsRecursive = false;
    }

    localVariables(): string[] {
        return [ ...this.localVars.keys() ];
    }
    allVariables(): string[] {
        return (
            (this.parent?.allVariables() ?? [])
            .concat([ ...this.localVariables() ])
        );
    }

    static root(): ToIRTermCtx {
        return new ToIRTermCtx( undefined );
    }

    newChild(): ToIRTermCtx {
        return new ToIRTermCtx( this );
    }

    private localVarSym( name: string ): symbol | undefined {
        return this.localVars.get( name );
    }

    getVarAccessSym( name: string ): symbol | undefined {
        return (
            this.localVarSym( name )
            ?? this.parent?.getVarAccessSym( name )
        );
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

        // allow shadowing
        // const exsistingCtx = this.variableToCtx.get( name );
        // if(
        //     exsistingCtx
        //     && exsistingCtx.localVarSym( name ) !== undefined
        // ) throw new Error(`variable '${name}' already defined in the current scope`);
        if( this.localVars.has( name ) ) {
            throw new Error(`variable '${name}' already defined in the current scope`);
        }

        const sym = typeof varName === "string" ? Symbol( name ) : varName;
        this.localVars.set( name, sym );
        // this.variableToCtx.set( name, this );
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