
export enum InlineSingleUseVarsFlags {
    none = 0,
    isRecursiveFunction = 1 << 0,
}

interface InlineSingleUseCtxMeta {
    readonly isRecursiveContext: boolean;
}

const defaultInlineMeta: InlineSingleUseCtxMeta = Object.freeze({
    isRecursiveContext: false
});

export class InlineSingleUseCtx
{
    readonly localVarsUses: Record<symbol, number>;
    readonly localVarsFlags: Record<symbol, InlineSingleUseVarsFlags>;

    readonly meta: InlineSingleUseCtxMeta;

    constructor(
        readonly params: symbol[],
        readonly parent: InlineSingleUseCtx | undefined,
        meta: InlineSingleUseCtxMeta
    ) {
        params = params.slice();

        this.localVarsUses = {};
        this.localVarsFlags = {};
        for( const p of params ) {
            this.localVarsUses[p] = 0;
            this.localVarsFlags[p] = InlineSingleUseVarsFlags.none;
        }

        meta = {
            ...meta,
            isRecursiveContext: parent?.meta.isRecursiveContext ?? defaultInlineMeta.isRecursiveContext
        };
        this.meta = meta;
    }
    static root( params: symbol[] = [] ): InlineSingleUseCtx {
        return new InlineSingleUseCtx( params, undefined, defaultInlineMeta );
    }

    newChild(
        params: symbol[],
        meta: InlineSingleUseCtxMeta = defaultInlineMeta
    ): InlineSingleUseCtx {
        return new InlineSingleUseCtx( params, this, meta );
    }

    private keys(): symbol[]
    {
        return Object.getOwnPropertySymbols( this.localVarsUses );
    }

    private getIncrement(): number
    {
        return this.meta.isRecursiveContext ? 10 : 1;
    }

    incrementVarUse( sym: symbol ): void
    {
        if( typeof this.localVarsUses[sym] !== "number" ) {
            if( this.parent ) this.parent.incrementVarUse( sym );
            else {
                console.error( sym );
                throw new Error("trying to increment use of variable not in context");
            }
        }
        else this.localVarsUses[sym] += this.getIncrement();
    }

    getSingleUseVars(): symbol[]
    {
        const keys = this.keys();
        return keys.filter( k => this.localVarsUses[k] === 1 );
    }
}