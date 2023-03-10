import { Integer } from "../../../../../types/ints/Integer";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { PInt } from "../../../PTypes";
import { Term } from "../../../Term";
import { int } from "../../../type_system/types";
import { TermInt, addPIntMethods } from "../UtilityTerms";

export function pInt( n: Integer | number | bigint ): TermInt
{
    return addPIntMethods(
        new Term<PInt>(
            int,
            _dbn => UPLCConst.int( n ),
            true
        )
    );
}