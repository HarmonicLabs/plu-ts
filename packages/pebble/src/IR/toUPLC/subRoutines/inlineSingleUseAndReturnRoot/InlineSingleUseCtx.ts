
export class InlineSingleUseCtx
{
    readonly localVars: Record<symbol, number>;

    constructor(
        readonly params: symbol[],
        readonly parent: InlineSingleUseCtx | undefined,
    ) {
        params = params.slice();

        this.localVars = {};
        for( const p of params ) this.localVars[p] = 0;
    }
    static root( params: symbol[] = [] ): InlineSingleUseCtx {
        return new InlineSingleUseCtx( params, undefined );
    }

    newChild( params: symbol[] ): InlineSingleUseCtx {
        return new InlineSingleUseCtx( params, this );
    }

    private keys(): symbol[]
    {
        return Object.getOwnPropertySymbols( this.localVars );
    }

    incrementVarUse( sym: symbol ): void
    {
        if( typeof this.localVars[sym] !== "number" ) {
            if( this.parent ) this.parent.incrementVarUse( sym );
            else {
                console.error( sym );
                throw new Error("trying to increment use of variable not in context");
            }
        }
        else this.localVars[sym]++;
    }

    getSingleUseVars(): symbol[]
    {
        const keys = this.keys();
        return keys.filter( k => this.localVars[k] === 1 );
    }
}