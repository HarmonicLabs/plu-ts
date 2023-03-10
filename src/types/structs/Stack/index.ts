import { PlutsStackError } from "../../../errors/PlutsStructError/PlutsStackError";

export default class Stack<T = any>
{
    private _stack: T[];
    constructor(init: T[] = [])
    {
        this._stack = init;
    }

    get length(): number
    {
        return this._stack.length;
    }

    get isEmpty(): boolean
    {
        return this.length <= 0;
    }

    get top(): Readonly<T> | undefined
    {
        if( this.isEmpty ) return undefined;
        return this.top;
    }

    push( ...values: T[] ): void
    {
        this._stack.push( ...values );
    }

    pop(): T | undefined
    {
        return this._stack.pop();
    }
}