

export default class Pair< A, B >
{
    get [Symbol.toStringTag](): string
    {
        return "Pair";
    }

    static isStrictInstance( any: any ): boolean
    {
        return Object.getPrototypeOf( any ) === Pair.prototype;
    }

    private _fst: A;
    private _snd: B;

    get fst(): A
    {
        return this._fst;
    }

    get snd(): B{
        return this._snd;
    }

    constructor( a: A, b: B )
    {
        this._fst = a;
        this._snd = b;
    }

    asObj(): { fst: A, snd: B }
    {
        return {
            fst: this.fst,
            snd: this.snd
        };
    }
}