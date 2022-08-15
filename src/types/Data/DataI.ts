import Cloneable from "../interfaces/Cloneable";
import Integer from "../ints/Integer";


export default class DataI
    implements Cloneable<DataI>
{
    private _int: Integer
    get int(): Integer { return this._int.clone() }

    constructor( I: Integer | number | bigint )
    {
        if( typeof I === "number" || typeof I === "bigint" )
        {
            I = new Integer( I );
        }

        this._int = I;
    }

    clone(): DataI
    {
        return new DataI( this._int.clone() );
    }
}