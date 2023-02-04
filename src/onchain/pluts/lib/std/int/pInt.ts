import { Integer } from "../../../../../types/ints/Integer";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { PInt } from "../../../PTypes";
import { Term, Type } from "../../../Term";
import { TermInt, addPIntMethods } from "../UtilityTerms";

export function pInt( int: Integer | number | bigint ): TermInt
{
    return addPIntMethods(
        new Term<PInt>(
            Type.Int,
            _dbn => UPLCConst.int( int ),
            true
        )
    );
}