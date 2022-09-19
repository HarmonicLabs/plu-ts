import Cloneable from "../../../types/interfaces/Cloneable";
import JsRuntime from "../../../utils/JsRuntime";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import ConstType, { constT, ConstTyTag } from "../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { pBSToData, pdecodeUtf8, pencodeUtf8, punBData } from "../Prelude/Builtins";
import TermStr from "../Prelude/UtilityTerms/TermStr";
import { PDataRepresentable } from "../PType";
import Term from "../Term";
import Type, { TermType } from "../Term/Type";
import PDataBS from "./PData/PDataBS";

export default class PString extends PDataRepresentable
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
    static override get fromData(): (data: Term<PDataBS>) => TermStr {
        return (data: Term<PDataBS>) => pdecodeUtf8.$( punBData.$( data ) )
    }
    static override toData(term: Term<PString>): Term<PDataBS>
    {
        return pBSToData.$( pencodeUtf8.$( term ) )
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