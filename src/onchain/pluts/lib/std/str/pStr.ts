import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { Term, Type } from "../../../Term";
import { TermStr, addPStringMethods } from "../UtilityTerms";

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