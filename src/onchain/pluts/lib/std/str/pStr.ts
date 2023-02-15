import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { Term } from "../../../Term";
import { TermStr, addPStringMethods } from "../UtilityTerms";
import { str } from "../../../type_system/types"

export function pStr( string: string ): TermStr
{
    return addPStringMethods(
        new Term(
            str,
            _dbn => UPLCConst.str( string )
        )
    );
}

export const pString = pStr;