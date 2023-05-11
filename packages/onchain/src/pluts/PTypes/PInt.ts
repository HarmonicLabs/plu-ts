import { Cloneable } from "../../utils/Cloneable";
import { PDataRepresentable } from "../PType/PDataRepresentable";

export class PInt extends PDataRepresentable
    implements Cloneable<PInt>
{
    private _pint: bigint
    get pint(): bigint { return this._pint }

    constructor( int: number | bigint = 0 )
    {
        super();

        if( typeof int === "number" ) int = BigInt( int );

        this._pint = int;
    }

    clone(): PInt
    {
        return new PInt( this.pint );
    }
}