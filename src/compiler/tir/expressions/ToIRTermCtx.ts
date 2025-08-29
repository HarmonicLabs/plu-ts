
const _1n = BigInt(1);

export class ToIRTermCtx
{
    private readonly variables: string[] = [];
    private readonly _parentDbn: bigint;

    get dbn(): bigint {
        return this._parentDbn + BigInt(this.variables.length);
    }

    constructor(
        readonly parent: ToIRTermCtx | undefined,
        /**
         * quick access from a variable name to its context
         * used to resolve the variables in 0(1) time
         */
        private readonly variableToCtx: Map<string, ToIRTermCtx>
    ) {
        this._parentDbn = parent ? parent._parentDbn : BigInt(0);
    }

    static root(): ToIRTermCtx {
        return new ToIRTermCtx( undefined, new Map<string, ToIRTermCtx>() );
    }

    newChild(): ToIRTermCtx {
        return new ToIRTermCtx( this, this.variableToCtx );
    }

    private localVarDbn( name: string ): bigint | undefined {
        const idx = this.variables.indexOf( name );
        if( idx < 0 ) return undefined;
        return this._parentDbn + BigInt(idx);
    }

    getVarDeclDbn( name: string ): bigint | undefined {
        const ctx = this.variableToCtx.get( name );
        if( !ctx ) return undefined;
        return ctx.localVarDbn( name );
    }

    getVarAccessDbn( name: string ): bigint | undefined {
        const declDbn = this.getVarDeclDbn( name );
        if( typeof declDbn !== "bigint" ) return undefined;
        return this.dbn - ( declDbn + _1n );
    }

    defineVar( name: string ): void {
        if( this.variableToCtx.has( name ) ) {
            const ctx = this.variableToCtx.get( name )!;
            if( ctx.localVarDbn( name ) !== undefined ) {
                throw new Error(`variable '${name}' already defined in the current scope`);
            }
        }
        this.variables.push( name );
        this.variableToCtx.set( name, this );
    }

    pushUnusedVar(): void {
        this.variables.push( "" ); // just to increment dbn
    }
}