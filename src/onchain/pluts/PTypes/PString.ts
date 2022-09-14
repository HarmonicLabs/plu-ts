import Cloneable from "../../../types/interfaces/Cloneable";
import JsRuntime from "../../../utils/JsRuntime";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import ConstType, { constT, ConstTyTag } from "../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { pdecodeUtf8, punBData } from "../Prelude/Builtins";
import TermStr from "../Prelude/TermStr";
import PType from "../PType";
import Term from "../Term";
import Type, { Type as Ty } from "../Term/Type";
import PData from "./PData";
import PDataBS from "./PData/PDataBS";

export default class PString extends PType
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

    static override get termType(): Ty { return Type.Str }
    static override get fromData(): (data: Term<PDataBS>) => TermStr {
        return (data: Term<PDataBS>) => pdecodeUtf8.$( punBData.$( data ) )
    }
}

export function pStr( str: string ): Term<PString>
{
    return new Term(
        Type.Str,
        _dbn => UPLCConst.str( str )
    )
}

export const pString = pStr;