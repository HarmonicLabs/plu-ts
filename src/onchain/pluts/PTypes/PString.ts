import Cloneable from "../../../types/interfaces/Cloneable";
import JsRuntime from "../../../utils/JsRuntime";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import ConstType, { constT, ConstTyTag } from "../../UPLC/UPLCTerms/UPLCConst/ConstType";
import PType from "../PType";
import Term from "../Term";

export default class PString extends PType
    implements Cloneable<PString>
{
    private _pstring: string

    constructor( str: string = "" )
    {
        super();
        this._pstring = str;
    }

    static override get default(): PString
    {
        return new PString( "" );
    }

    override get ctor(): new () => PString { return PString };

    clone(): PString
    {
        return new PString( this._pstring )
    }
}

export function pStr( str: string ): Term<PString>
{
    return new Term(
        _dbn => UPLCConst.str( str ),
        new PString( str )
    )
}

export const pString = pStr;