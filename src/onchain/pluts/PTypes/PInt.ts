import { Integer } from "../../../types/ints/Integer";
import { PDataRepresentable } from "../PType/PDataRepresentable";

export class PInt extends PDataRepresentable
//    implements Cloneable<PInt>
{
    private _pint: bigint
    get pint(): bigint { return this._pint }

    constructor( int: Integer | number | bigint = 0 )
    {
        super();

        if( typeof int === "number" ) int = BigInt( int );
        if( int instanceof Integer ) int = int.asBigInt;

        this._pint = int;
    }
}