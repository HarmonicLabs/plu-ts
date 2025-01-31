import { Cloneable } from "../../utils/Cloneable";
import { PDataRepresentable } from "../PType/PDataRepresentable";

export class PBool extends PDataRepresentable
    implements Cloneable< PBool >
{
    private _pbool: boolean

    constructor( bool: boolean = false )
    {
        super();
        this._pbool = bool;
    }

    clone(): PBool
    {
        return new PBool( this._pbool );
    }
    
}