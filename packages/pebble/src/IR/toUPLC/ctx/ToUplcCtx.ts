
export class ToUplcCtx
{
    readonly parent: ToUplcCtx | undefined;
    readonly ctxMap: Map<symbol, ToUplcCtx>;

    private readonly _variables: symbol[];

    private get _parentDbn(): number {
        return this.parent?.dbn ?? 0;
    }
    get dbn(): number {
        return this._variables.length + this._parentDbn;
    }

    private _frozen: boolean;
    
    constructor(
        parent: ToUplcCtx | undefined,
        variables: symbol[],
    ) {
        this.parent = parent;
        this.ctxMap = this.parent?.ctxMap ?? new Map();
        this._variables = variables;
        for( const v of variables ) this.ctxMap.set( v, this );
    }

    static root(): ToUplcCtx {
        return new ToUplcCtx( undefined, [] );
    }

    newChild( variables: symbol[] ): ToUplcCtx {
        return new ToUplcCtx( this, variables );
    }

    getVarDeclDbn( sym: symbol ): number
    {
        const ctx = this.ctxMap.get( sym );
        const idx = ctx?._variables.indexOf( sym ) ?? -1;
        if( idx <= -1 ) {
            console.log( sym, ctx?.allVars() );
            throw new Error("Variable not found in its defining context");
        }
        const declDbn = ctx!._parentDbn + idx + 1;
        if(
            declDbn === 5
            && sym.description === "tailList"
        ) {
            console.log({
                ctxDbn: ctx!.dbn,
                idx
            });
        }
        return declDbn;
    }

    getVarAccessDbn( sym: symbol ): number
    {
        const declDbn = this.getVarDeclDbn( sym );
        return this.dbn - declDbn;
    }

    toJson(): any
    {
        let obj: any = {};
        let prevCtx: any | null = null;
        let ctx: ToUplcCtx | undefined = this;
        do {
            obj["parentDbn"] = ctx._parentDbn;
            obj["dbn"] = ctx.dbn;
            obj["vars"] = ctx._variables.slice();
            obj["next"] = prevCtx;
            prevCtx = obj;
            obj = {};
            ctx = ctx.parent;
        } while( ctx )
        return prevCtx;
    }

    allVars(): symbol[]
    {
        let vars: symbol[] = [];
        let ctx: ToUplcCtx = this;
        while( ctx = ctx.parent! ) {
            vars = ctx._variables.concat( vars );
        }
        return vars;
    }

    // for debugging purposes
    // "inefficient" but correct way to get expected de bruijn index
    expectedDbn( sym: symbol ): number
    {
        const vars = this.allVars();
        return vars.length - 1 - vars.lastIndexOf( sym )
    }

}