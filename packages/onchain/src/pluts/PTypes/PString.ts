import { Cloneable } from "../../utils/Cloneable";
import { PDataRepresentable } from "../PType/PDataRepresentable";

export class PString extends PDataRepresentable
    implements Cloneable<PString>
{
    private _pstring: string

    constructor( str: string = "" )
    {
        super();
        this._pstring = str;
    }

    clone(): PString
    {
        return new PString( this._pstring )
    }
}