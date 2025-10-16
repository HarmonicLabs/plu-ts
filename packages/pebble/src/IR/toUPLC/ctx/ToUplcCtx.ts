
export class ToUplcCtx
{
    readonly parent: ToUplcCtx | undefined;
    readonly ctxMap: Map<symbol, ToUplcCtx>;

    private readonly _variables: symbol[];

    private readonly _parentDbn: number;
    private get dbn(): number {
        return this._variables.length + this._parentDbn;
    }

    private _frozen: boolean;
    
    constructor(
        parent: ToUplcCtx | undefined
    ) {
        parent?.freeze();
        this.parent = parent;
        this.ctxMap = this.parent?.ctxMap ?? new Map();
        this._parentDbn = parent instanceof ToUplcCtx ? parent.dbn : 0;
        this._variables = [];
        this._frozen = false;
    }

    static root(): ToUplcCtx {
        return new ToUplcCtx( undefined );
    }

    newChild(): ToUplcCtx {
        this.freeze();
        return new ToUplcCtx( this );
    }

    private freeze(): void {
        this._frozen = true;
    }

    defineVars( syms: symbol[] ): void
    {
        for( const s of syms ) this.defineVar( s );
    }

    defineVar( sym: symbol ): void
    {
        if( this._frozen ) throw new Error("Context is frozen");
        if( this.ctxMap.has( sym ) ) {
            throw new Error("Variable already defined in context");
        }
        this.ctxMap.set( sym, this );
        this._variables.push( sym );
    }

    getVarAccessDbn( sym: symbol ): number
    {
        const ctx = this.ctxMap.get( sym );
        const idx = ctx?._variables.indexOf( sym ) ?? -1;
        if( idx <= -1 ) throw new Error("Variable not found in its defining context");
        return ctx!.dbn - idx - 1;
    }

}