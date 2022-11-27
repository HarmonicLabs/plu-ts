import Cloneable from "../../../types/interfaces/Cloneable";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import PDataRepresentable from "../PType/PDataRepresentable";
import { pBSToData, pdecodeUtf8, pencodeUtf8, punBData } from "../stdlib/Builtins";
import TermStr, { addPStringMethods } from "../stdlib/UtilityTerms/TermStr";
import Term from "../Term";
import Type, { TermType } from "../Term/Type/base";
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
    /**
     * @deprecated try to use 'fromDataTerm.$'
     */
    static override get fromData(): (data: Term<PDataBS>) => TermStr {
        return (data: Term<PDataBS>) => pdecodeUtf8.$( punBData.$( data ) )
    }
    /**
     * @deprecated try to use 'toDataTerm.$'
     */
    static override toData(term: Term<PString>): Term<PDataBS>
    {
        return pBSToData.$( pencodeUtf8.$( term ) )
    }
}

export function pStr( str: string ): TermStr
{
    return addPStringMethods(
        new Term(
            Type.Str,
            _dbn => UPLCConst.str( str )
        )
    );
}

export const pString = pStr;