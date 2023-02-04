import { Cloneable } from "../../../types/interfaces/Cloneable";
import { PDataRepresentable } from "../PType/PDataRepresentable";
import { Type, TermType } from "../Term/Type/base";

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

    static override get termType(): TermType { return Type.Bool }
    
}