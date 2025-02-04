import { IRConst } from "../../../../IR/IRNodes/IRConst";
import { PInt } from "../../../PTypes";
import { Term } from "../../../Term";
import { int } from "../../../../type_system/types";
import { TermInt, addPIntMethods } from "../UtilityTerms/TermInt";

export function pInt( n: number | bigint ): TermInt
{
    return addPIntMethods(
        new Term<PInt>(
            int,
            _dbn => IRConst.int( BigInt( n ) ),
            true
        )
    );
}