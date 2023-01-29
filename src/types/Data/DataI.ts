import ToJson from "../../utils/ts/ToJson";
import Cloneable from "../interfaces/Cloneable";
import Integer from "../ints/Integer";


export default class DataI
    implements Cloneable<DataI>, ToJson
{
    private _int: Integer
    get int(): Integer { return Object.freeze( this._int ) as any }

    constructor( I: Integer | number | bigint = 0 )
    {
        if( typeof I === "number" || typeof I === "bigint" )
        {
            I = new Integer( I );
        }

        this._int = I.clone();
    }

    clone(): DataI
    {
        return new DataI(
            this._int
            // .clone()
            // the constructor clones the fields
        );
    }

    toJson()
    {
        return { int: this._int.asBigInt.toString() }
    }
}