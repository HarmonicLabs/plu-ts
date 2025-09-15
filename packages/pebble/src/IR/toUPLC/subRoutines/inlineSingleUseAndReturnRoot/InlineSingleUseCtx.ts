
export class InlineSingleUseCtx
{
    readonly localVarsUseCount: number[];

    // MUST BE A GETTER TO REFLECT CHANGES IN PARENT
    // DO NOT MODIFY
    private get _parentDbn(): bigint {
        return this.parent?.dbn ?? BigInt(0);
    }
    get dbn(): bigint {
        return this._parentDbn + BigInt(this.localVarsUseCount.length);
    }

    constructor(
        readonly arity: number,
        readonly parent: InlineSingleUseCtx | undefined,
    ) {
        // DO NOT SET _parentDbn HERE
        // it must be a getter to reflect changes in parent
        // (parent dbn can change)

        if( arity < 0 ) throw new Error(`Cannot create InlineSingleUseCtx with negative arity (${arity})`);
        if( !Number.isSafeInteger( arity ) ) throw new Error(`Cannot create InlineSingleUseCtx with non safe integer arity (${arity})`);

        this.localVarsUseCount = new Array( arity ).fill(0);
    }

    static root( arity: number = 0 ): InlineSingleUseCtx {
        return new InlineSingleUseCtx( arity, undefined );
    }

    newChild( arity: number ): InlineSingleUseCtx {
        return new InlineSingleUseCtx( arity, this );
    }

    incrementVarUse( dbn: bigint | number ): void
    {
        const dbnNum = Number( dbn );
        if( dbnNum < 0 ) throw new Error(`Cannot increment use of a variable with negative De Bruijn index (${dbn})`);
        if( dbnNum >= this.dbn ) throw new Error(`Variable with De Bruijn index ${dbn} is unbound (max is ${this.dbn - BigInt(1)})`);
        return this._incrementVarUse( dbnNum );
    }

    private _incrementVarUse( dbn: number ): void
    {
        if( dbn >= this.localVarsUseCount.length ) {
            if( !this.parent ) throw new Error("Invariant broken: dbn >= localVarsUseCount.length but no parent");
            return this.parent._incrementVarUse( dbn - this.localVarsUseCount.length );
        }
        this.localVarsUseCount[ this.localVarsUseCount.length - 1 - dbn ]++;
    }

    forgetUnusedVars(): void
    {
        // same as
        // this.localVarsUseCount = this.localVarsUseCount.filter( u => u > 0 );
        // but in place

        for( let i = this.localVarsUseCount.length - 1; i >= 0; i-- ) {
            if( this.localVarsUseCount[i] === 0 ) {
                this.localVarsUseCount.splice( i, 1 );
            }
        }
    }
}