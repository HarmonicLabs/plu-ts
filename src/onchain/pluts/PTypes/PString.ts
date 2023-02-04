import { Cloneable } from "../../../types/interfaces/Cloneable";
import { PDataRepresentable } from "../PType/PDataRepresentable";
import { Type, TermType } from "../Term/Type/base";

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

    static override get termType(): TermType { return Type.Str }
}