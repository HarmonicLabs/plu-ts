import { Term } from "../../../Term";
import { TermStr, addPStringMethods } from "../UtilityTerms";
import { str } from "../../../../type_system/types"
import { IRConst } from "../../../../IR/IRNodes/IRConst";

export function pStr( string: string ): TermStr
{
    return addPStringMethods(
        new Term(
            str,
            _dbn => IRConst.str( string ),
            // true // isConstant
        )
    );
}

export const pString = pStr;