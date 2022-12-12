import { PType, Term } from "..";


class TermCont<A> implements PromiseLike<A>
{
    // takes a callback as input and calls that callback with the current partial value;
    // example:
    // TermCont.pure( 2 ).then
    private _f: <ResultT>( cb: ( partialValue: A ) => TermCont<ResultT> ) => TermCont<ResultT>;
    constructor( f: <ResultT>( cb: ( partialValue: A ) => TermCont<ResultT> ) => TermCont<ResultT> )
    {
        this._f = f;
    }

    static pure<A>( value: A ): TermCont<A>
    {
        return new TermCont( cb => cb( value ) );
    }

    static run<A, ReturnT = A>( t: TermCont<A>, handle: ( partialValue: A ) => ReturnT = ( thisPartialValue => thisPartialValue as any )): ReturnT
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

/* STUFF THAT MIGHT TURN USEFULL

stack overflow led controller: https://stackoverflow.com/questions/20967006/how-to-create-a-sleep-delay-in-nodejs-that-is-blocking

```
function LedController(timeout) {
    this.timeout = timeout || 100;
    this.queue = [];
    this.ready = true;
}

LedController.prototype.send = function(cmd, callback) {
    sendCmdToLed(cmd);
    if (callback) callback();
    // or simply `sendCmdToLed(cmd, callback)` if sendCmdToLed is async
};

LedController.prototype.exec = function() {
    this.queue.push(arguments);
    this.process();
};

LedController.prototype.process = function() {
    if (this.queue.length === 0) return;
    if (!this.ready) return;
    var self = this;
    this.ready = false;
    this.send.apply(this, this.queue.shift());
    setTimeout(function () {
        self.ready = true;
        self.process();
    }, this.timeout);
};

var Led = new LedController();
```
*/
class TermRunner
{
    static run<A extends PType, ReturnT extends PType>( termProgram: ( this: TermRunner, partialResult: Term<A> ) => Term<ReturnT> )
    {
        const f = termProgram.bind( new TermRunner() );
    }
}