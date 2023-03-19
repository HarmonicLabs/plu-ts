import { Integer } from "../../../../../types/ints/Integer";
import { IRConst } from "../../../../IR/IRNodes/IRConst";
import { PInt } from "../../../PTypes";
import { Term } from "../../../Term";
import { int } from "../../../type_system/types";
import { TermInt, addPIntMethods } from "../UtilityTerms";

export function pInt( n: Integer | number | bigint ): TermInt
{
    return addPIntMethods(
        new Term<PInt>(
            int,
            _dbn => IRConst.int( n instanceof Integer ? n.asBigInt : n ),
            true
        )
    );
}