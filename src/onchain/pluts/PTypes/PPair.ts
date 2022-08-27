import PType from "../PType";

export default class PPair<A extends PType, B extends PType > extends PType
{
    private _a: A
    private _b: B

    constructor( a: A = new PType as A, b: B = new PType as B )
    {
        super();

        this._a = a;
        this._b = b;
    }

    static override get default(): PPair<PType, PType>
    {
        return new PPair( new PType, new PType )    
    }

    override get ctor(): new () => PPair<PType, PType> { return PPair };

}