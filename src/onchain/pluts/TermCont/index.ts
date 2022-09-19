

class TermCont<A> implements PromiseLike<A>
{
    private _f: <ResultT>( cb: ( partialValue: A ) => TermCont<ResultT> ) => TermCont<ResultT>;
    constructor( f: <ResultT>( cb: ( partialValue: A ) => TermCont<ResultT> ) => TermCont<ResultT> )
    {
        this._f = f;
    }

    static pure<A>( value: A ): TermCont<A>
    {
        return new TermCont( cb => cb( value ) );
    }

    static run<A, ReturnT>( t: TermCont<A>, handle: ( partialValue: A ) => ReturnT = ( thisPartialValue => thisPartialValue as any )): ReturnT
    {
        return t._f( handle as any ) as any;
    }

    then<ResultT>( continuation: ( (value: A) => TermCont<ResultT> ) ): TermCont<ResultT>
    {
        return this._f( thisPartialValue =>  
            continuation( thisPartialValue )
        );
    }
}