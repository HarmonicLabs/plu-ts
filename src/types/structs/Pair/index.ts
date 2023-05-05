

export class Pair< A, B >
{
    get [Symbol.toStringTag](): string
    {
        return `Pair( ${this.fst}, ${this.snd} )`;
    }

    static isStrictInstance( any: any ): any is Pair<any,any>
    {
        if( any === undefined || any === null ) return false;
        return Object.getPrototypeOf( any ) === Pair.prototype;
    }

    fst: A;
    snd: B;

    constructor( a: A, b: B )
    {
        this.fst = a;
        this.snd = b;
    }

    asObj(): { fst: A, snd: B }
    {
        return {
            fst: this.fst,
            snd: this.snd
        };
    }
}